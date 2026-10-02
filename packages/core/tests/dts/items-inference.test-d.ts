/*
 * Type-level tests for items → modelValue inference. Run by `pnpm test:dts`.
 *
 * =============================================================================
 * How items type inference should work
 * =============================================================================
 *
 * `items` is the source of truth. From its shape we derive:
 *   - the raw item type (what each option is before normalization)
 *   - the selected value type (what `modelValue` / `default` accept)
 *   - the allowed keys/signatures for item* and group* props
 *
 * Events (`change`, `update:modelValue`, `load`, …) and component slots that
 * expose items follow the same derived value / item types.
 *
 * `multiple` on VfSelect wraps the value type in an array; single-select uses
 * `Value | null`. VfRadios is always single (`Value | null`); VfCheckboxes is
 * always multi (`Value[]`).
 *
 * When `items` is omitted / unconstrained, model and key props stay loose
 * (`any` / `string`) so non-generic usages keep working.
 *
 * -----------------------------------------------------------------------------
 * 1. Plain array of scalars — e.g. `[1, 2, 3]`, `['a', 'b']`, or
 *    `['foo', 'bar'] as const`
 * -----------------------------------------------------------------------------
 *
 * Item type = the scalar element type (number, string, …). With `as const` /
 * readonly tuples this is the literal union (e.g. `'foo' | 'bar' | 'baz'`).
 * Value type = the same scalar / literal type.
 *
 * At runtime each scalar is wrapped into `{ value, label }` with both fields
 * equal to the scalar. Typing matches that: there is no separate object shape
 * to pick keys from.
 *
 * Related props:
 *   - modelValue / default  → must be `Scalar | null` (or `Scalar[]` when
 *     multiple). A string model with number items is an error.
 *   - itemValue / itemLabel / itemDisabled / itemConditions
 *   - groupLabel / groupChildren / groupConditions
 *       → all forbidden (typed as `never`). Runtime already uses synthetic
 *         `{ value, label }` equal to the scalar; key/group props are not
 *         meaningful.
 *
 * -----------------------------------------------------------------------------
 * 2. Plain object (record map) — e.g. `{ us: 'United States', de: 'Germany' }`
 * -----------------------------------------------------------------------------
 *
 * Item type  = synthetic `{ value: Key; label: Entry }` where Key is the
 *              object key type and Entry is the value type.
 * Value type = the key type (e.g. `'us' | 'de'`).
 *
 * Runtime already normalizes `{ key: label }` into `{ value: key, label }`.
 *
 * Related props:
 *   - modelValue / default  → must be `Key | null` (or `Key[]` when multiple).
 *   - itemValue / itemLabel / itemDisabled / itemConditions
 *   - groupLabel / groupChildren / groupConditions
 *                           → all forbidden (typed as `never`). The synthetic
 *                             value/label mapping is fixed; grouping does not
 *                             apply.
 *
 * -----------------------------------------------------------------------------
 * 3. Array of objects — e.g. `[{ id: 1, name: 'Foo' }, …]`
 * -----------------------------------------------------------------------------
 *
 * Item type  = the object element type.
 * Value type = depends on `itemValue`:
 *   - `itemValue` is a string key   → `item[itemValue]` (e.g. `'id'` → number)
 *   - `itemValue` is a function     → that function's return type
 *   - `itemValue` omitted           → the whole item object (matches runtime:
 *                                     when `itemValue` is unset the selected
 *                                     value is the full object, even if it has
 *                                     a `value` property)
 *
 * Related props (all enforced against the item object shape):
 *   - modelValue / default  → must match the derived value type (or array /
 *                             `| null` per multiple / single). These props use
 *                             `NoInfer` so they do not compete with `itemValue`
 *                             when inferring generics.
 *   - itemValue             → split across `TItemValueKey` (string key) and
 *                             `TItemValueReturn` (mapper return). The `item`
 *                             arg is always contextually typed from `items`,
 *                             even for bare inline arrows. For the return type
 *                             to drive the model under Vue's single-pass
 *                             inference, use a named/typed function or annotate
 *                             the param — e.g. `(item: Item) => item.id`.
 *                             Unknown string keys (e.g. `'nope'`) are errors.
 *   - itemLabel             → `keyof Item` or `(item: Item) => string`.
 *   - itemDisabled          → `keyof Item` or
 *                             `(item: Item) => ConditionalProp | undefined`.
 *   - itemConditions        → same as itemDisabled.
 *   - group*                → not applicable unless also grouping (see §6).
 *
 * -----------------------------------------------------------------------------
 * 4. Endpoint URL string — e.g. `items="/api/items"`
 * -----------------------------------------------------------------------------
 *
 * Item type  = unknown (payload shape is not known at compile time).
 * Value type = free: inferred from the `modelValue` / `default` / `v-model`
 *              binding (`TModel`). Items do not constrain the model here.
 *
 * Related props:
 *   - modelValue / default  → whatever the consumer binds; that binding
 *                             drives `TModel` (and thus events).
 *   - itemValue / itemLabel / itemDisabled / itemConditions
 *                           → stay loosely typed (string key or function),
 *                             since the remote item shape is unknown.
 *   - transformItems / headers / method
 *                           → available for loading; not part of value
 *                             inference.
 *   - group*                → same loose typing if used after transform.
 *
 * -----------------------------------------------------------------------------
 * 5. Function / async function — e.g. `() => […]` or `async () => […]`
 * -----------------------------------------------------------------------------
 *
 * The return type is unwrapped (`Awaited<ReturnType>`), then inference
 * recurses as if `items` were that resolved value:
 *   - returns a scalar array     → §1
 *   - returns a record object    → §2
 *   - returns an object array    → §3
 *   - returns a grouped array    → §6 (when groupChildren is set)
 *
 * `itemsTrigger` / `itemsDebounce` affect when the function re-runs at
 * runtime; they do not change the inferred types.
 *
 * Related props (modelValue, default, item*, group*) follow the rule for
 * whatever shape the function resolves to — including forbidding item* key
 * props when the resolved shape is a scalar array or record map.
 *
 * -----------------------------------------------------------------------------
 * 6. Grouped items — array of groups + groupChildren
 * -----------------------------------------------------------------------------
 *
 * When `groupChildren` (and typically `groupLabel`) is set, `items` is an
 * array of group objects. The effective item type is taken from each group's
 * children (via the `groupChildren` key or mapping function), then §1–§3
 * apply to those children for value / item* inference.
 *
 * Example:
 *   items: [{ label: 'A', children: [{ id: 1, name: 'Foo' }] }]
 *   groupLabel: 'label'
 *   groupChildren: 'children'
 *   itemValue: 'id'
 *   → item = `{ id: number; name: string }`
 *   → value = number
 *
 * Related props:
 *   - modelValue / default  → derived from the *child* item value (same as
 *                             §3 / §1), not from the group object.
 *   - itemValue / itemLabel / itemDisabled / itemConditions
 *                           → enforced against the *child* item shape.
 *   - groupLabel            → `keyof Group` or `(group: Group) => string`.
 *   - groupChildren         → `keyof Group` or
 *                             `(group: Group) => children array | record`.
 *                             This prop also selects which field feeds the
 *                             child item type into inference.
 *   - groupConditions       → `keyof Group` or
 *                             `(group: Group) => ConditionalProp | undefined`.
 *
 * -----------------------------------------------------------------------------
 * Component specifics
 * -----------------------------------------------------------------------------
 *
 *   - VfSelect: value is `Value | null`, or `Value[]` when `multiple` is true.
 *
 * Concrete `items` always win over a mismatched `v-model`: binding a string
 * ref to a select whose items are numbers is a type error. Only the endpoint
 * string case (§4) lets `v-model` define the model type.
 */
import { describe, expectTypeOf, test } from 'vitest'
import type { ExpressionString, GroupChildrenProp, ItemsModel, ItemValueOf, ItemsProp, RawItemOf } from '@vueform/core'
import type { SelectProps } from '@vueform/core/blueprints/select'
import type { VfSelectProps } from '@vueform/core/components/VfSelect'

/*
 * `NoInfer` is transparent for `extends` but not for strict type equality, so
 * the model-prop assertions below check mutual assignability with a pair of
 * `toExtend` calls instead of `toEqualTypeOf`.
 */

/*
 * `AllowsItemKeyProps` / `AllowedItemValueKey` / `AllowedGroupChildren` are
 * module-private in `features/items`, so recover them here from the public
 * `SelectProps` prop types they gate (`itemValue` / `groupChildren`) —
 * the assertions below then also exercise the user-visible prop surface.
 */
type AllowsItemKeyProps<TItems extends ItemsProp> = [NonNullable<SelectProps<'select', TItems>['itemValue']>] extends [never] ? false : true
type AllowedItemValueKey<TItems extends ItemsProp, TGroupChildren extends GroupChildrenProp = undefined> = Extract<NonNullable<SelectProps<'select', TItems, undefined, TGroupChildren>['itemValue']>, string>
type AllowedGroupChildren<TItems extends ItemsProp> = NonNullable<SelectProps<'select', TItems>['groupChildren']>

// Shared items fixtures.
type ScalarItems = ('a' | 'b')[]
type ConstItems = readonly ['foo', 'bar', 'baz']
type ObjectItem = { id: number; name: string }
type ObjectItems = ObjectItem[]
type LabelItem = { value: string; label: string }
type LabelItems = LabelItem[]
type RecordItems = { x: string; y: string }
type FnItems = () => ObjectItem[]
type AsyncFnItems = () => Promise<ObjectItem[]>
type Group = { label: string; children: ObjectItem[] }
type GroupItems = Group[]

describe('scalar array items', () => {
  test('item / value / model derive from the scalar element type', () => {
    expectTypeOf<RawItemOf<ScalarItems>>().toEqualTypeOf<'a' | 'b'>()
    expectTypeOf<ItemValueOf<ScalarItems>>().toEqualTypeOf<'a' | 'b'>()
    expectTypeOf<ItemsModel<ScalarItems>>().toEqualTypeOf<'a' | 'b' | null>()
    expectTypeOf<ItemsModel<ScalarItems, 'value', undefined, true>>().toEqualTypeOf<('a' | 'b')[]>()
  })
})

describe('readonly / as const scalar tuple', () => {
  test('literal union drives item / value / model', () => {
    expectTypeOf<RawItemOf<ConstItems>>().toEqualTypeOf<'foo' | 'bar' | 'baz'>()
    expectTypeOf<ItemValueOf<ConstItems>>().toEqualTypeOf<'foo' | 'bar' | 'baz'>()
    expectTypeOf<ItemsModel<ConstItems>>().toEqualTypeOf<'foo' | 'bar' | 'baz' | null>()
  })

  test('SelectProps modelValue is the literal union and rejects plain string', () => {
    expectTypeOf<SelectProps<'select', ConstItems>['modelValue']>().toExtend<'foo' | 'bar' | 'baz' | null | undefined>()
    expectTypeOf<'foo' | 'bar' | 'baz' | null | undefined>().toExtend<SelectProps<'select', ConstItems>['modelValue']>()
    expectTypeOf<string>().not.toExtend<NonNullable<SelectProps<'select', ConstItems>['modelValue']>>()
  })
})

describe('object array items + itemValue key', () => {
  test('item is the element object; itemValue key picks the value', () => {
    expectTypeOf<RawItemOf<ObjectItems>>().toEqualTypeOf<ObjectItem>()
    expectTypeOf<ItemValueOf<ObjectItems, 'id'>>().toEqualTypeOf<number>()
    expectTypeOf<ItemsModel<ObjectItems, 'id'>>().toEqualTypeOf<number | null>()
    expectTypeOf<ItemsModel<ObjectItems, 'id', undefined, true>>().toEqualTypeOf<number[]>()
    expectTypeOf<ItemValueOf<ObjectItems>>().toEqualTypeOf<ObjectItem>()
  })

  // Object array with a `value` key still uses the whole object when itemValue
  // is unset; only an explicit itemValue:"value" picks the property.
  test('a `value` key only takes effect with an explicit itemValue', () => {
    expectTypeOf<ItemValueOf<LabelItems>>().toEqualTypeOf<LabelItem>()
    expectTypeOf<ItemValueOf<LabelItems, 'value'>>().toEqualTypeOf<string>()
    expectTypeOf<ItemsModel<LabelItems>>().toEqualTypeOf<LabelItem | null>()
    expectTypeOf<SelectProps<'select', LabelItems>['modelValue']>().toExtend<LabelItem | null | undefined>()
    expectTypeOf<LabelItem | null | undefined>().toExtend<SelectProps<'select', LabelItems>['modelValue']>()
    expectTypeOf<SelectProps<'select', LabelItems, 'value'>['modelValue']>().toExtend<string | null | undefined>()
    expectTypeOf<string | null | undefined>().toExtend<SelectProps<'select', LabelItems, 'value'>['modelValue']>()
    expectTypeOf<string>().not.toExtend<NonNullable<SelectProps<'select', LabelItems>['modelValue']>>()
  })
})

describe('record map items', () => {
  test('item is the synthetic { value, label }; value is the key union', () => {
    expectTypeOf<RawItemOf<RecordItems>>().toEqualTypeOf<{
      value: 'x' | 'y'
      label: string
    }>()
    expectTypeOf<ItemValueOf<RecordItems>>().toEqualTypeOf<'x' | 'y'>()
    expectTypeOf<ItemsModel<RecordItems>>().toEqualTypeOf<'x' | 'y' | null>()
  })
})

describe('function items source', () => {
  test('sync and async returns are unwrapped before inference', () => {
    expectTypeOf<RawItemOf<FnItems>>().toEqualTypeOf<ObjectItem>()
    expectTypeOf<ItemValueOf<FnItems, 'id'>>().toEqualTypeOf<number>()
    expectTypeOf<ItemValueOf<AsyncFnItems, 'id'>>().toEqualTypeOf<number>()
  })
})

describe('grouped items', () => {
  test('item / value derive from the group children', () => {
    expectTypeOf<RawItemOf<GroupItems, 'children'>>().toEqualTypeOf<ObjectItem>()
    expectTypeOf<ItemValueOf<GroupItems, 'id', 'children'>>().toEqualTypeOf<number>()
  })
})

describe('endpoint string items', () => {
  test('model is free and driven by the TModel binding', () => {
    expectTypeOf<ItemsModel<string, 'value', undefined, false, number | null>>().toEqualTypeOf<number | null>()
  })
})

describe('itemValue function', () => {
  test('mapper return type drives the value type', () => {
    expectTypeOf<ItemValueOf<ObjectItems, (item: ObjectItem) => string>>().toEqualTypeOf<string>()
    expectTypeOf<ItemValueOf<ObjectItems, undefined, undefined, string>>().toEqualTypeOf<string>()
  })

  // Inference from an itemValue mapper must win over a simultaneous modelValue
  // binding (NoInfer on the model prop), otherwise the value generics stay
  // unset and the model is typed as the whole item object.
  test('mapper inference wins over a simultaneous modelValue binding', () => {
    function inferSelectProps<TItems extends ObjectItems, TItemValueKey extends AllowedItemValueKey<TItems> | undefined = undefined, TItemValueReturn = unknown>(
      p: SelectProps<'select', TItems, TItemValueKey, undefined, false, any, TItemValueReturn>
    ): SelectProps<'select', TItems, TItemValueKey, undefined, false, any, TItemValueReturn>['modelValue'] {
      return p.modelValue
    }

    const inferredFnModel = inferSelectProps({
      name: 'x',
      items: [{ id: 1, name: 'Foo' }],
      // Mapper needs a typed parameter (or a named function) for
      // `TItemValueReturn` to infer under multi-generic Vue components. Bare
      // unannotated arrows still contextually type `item`, but leave the model
      // as the whole item.
      itemValue: (item: ObjectItem) => String(item.id),
      modelValue: '1',
      default: '1',
    })
    expectTypeOf(inferredFnModel).toExtend<string | null | undefined>()
    expectTypeOf<string | null | undefined>().toExtend<typeof inferredFnModel>()

    const inferredKeyModel = inferSelectProps({
      name: 'x',
      items: [{ id: 1, name: 'Foo' }],
      itemValue: 'id',
      modelValue: 1,
    })
    expectTypeOf(inferredKeyModel).toExtend<number | null | undefined>()
    expectTypeOf<number | null | undefined>().toExtend<typeof inferredKeyModel>()
  })
})

describe('blueprint / component props', () => {
  test('SelectProps / VfSelectProps model derives from items + itemValue', () => {
    expectTypeOf<ItemsModel<ObjectItems, 'id'>>().toEqualTypeOf<number | null>()
    expectTypeOf<ItemsModel<ObjectItems, 'id', undefined, true>>().toEqualTypeOf<number[]>()

    type SelectWithObjects = SelectProps<'select', ObjectItems, 'id'>
    expectTypeOf<SelectWithObjects['modelValue']>().toExtend<number | null | undefined>()
    expectTypeOf<number | null | undefined>().toExtend<SelectWithObjects['modelValue']>()
    // `default` is expressionable, so it also accepts `{...}` expression strings.
    expectTypeOf<SelectWithObjects['default']>().toExtend<number | null | undefined | ExpressionString>()
    expectTypeOf<number | null | undefined | ExpressionString>().toExtend<SelectWithObjects['default']>()

    type VfSelectWithObjects = VfSelectProps<ObjectItems, 'id'>
    expectTypeOf<VfSelectWithObjects['modelValue']>().toExtend<number | null | undefined>()
    expectTypeOf<number | null | undefined>().toExtend<VfSelectWithObjects['modelValue']>()
  })

  // Valid itemValue keys remain assignable; invalid keys are rejected by the
  // TItemValueKey / TGroupChildren constraints (and itemLabel's key union).
  test('valid keys stay assignable; unknown keys are rejected', () => {
    type ValidItemValue = NonNullable<SelectProps<'select', ObjectItems, 'id'>['itemValue']>
    expectTypeOf<'id'>().toExtend<ValidItemValue>()
    expectTypeOf<'nope'>().not.toExtend<AllowedItemValueKey<ObjectItems>>()

    expectTypeOf<'not_value'>().not.toExtend<AllowedItemValueKey<LabelItems>>()
    expectTypeOf<'not_label'>().not.toExtend<NonNullable<SelectProps<'select', LabelItems>['itemLabel']>>()
    expectTypeOf<'not_items'>().not.toExtend<AllowedGroupChildren<LabelItems>>()
  })
})

describe('key props forbidden for synthetic shapes', () => {
  test('AllowsItemKeyProps per items shape', () => {
    expectTypeOf<AllowsItemKeyProps<ScalarItems>>().toEqualTypeOf<false>()
    expectTypeOf<AllowsItemKeyProps<RecordItems>>().toEqualTypeOf<false>()
    expectTypeOf<AllowsItemKeyProps<ObjectItems>>().toEqualTypeOf<true>()
    expectTypeOf<AllowsItemKeyProps<GroupItems>>().toEqualTypeOf<true>()
    expectTypeOf<AllowsItemKeyProps<string>>().toEqualTypeOf<true>()
    expectTypeOf<AllowsItemKeyProps<FnItems>>().toEqualTypeOf<true>()
    expectTypeOf<AllowsItemKeyProps<() => ('a' | 'b')[]>>().toEqualTypeOf<false>()
  })

  test('scalar / record shapes forbid item key props; mappers stay allowed', () => {
    expectTypeOf<NonNullable<SelectProps<'select', ScalarItems>['itemValue']>>().toBeNever()
    // Scalar arrays reject string-key lookup but still allow function mappers,
    // which receive the synthetic `{ value, label }` item.
    expectTypeOf<'label'>().not.toExtend<NonNullable<SelectProps<'select', ScalarItems>['itemLabel']>>()
    expectTypeOf<(item: any) => string>().toExtend<NonNullable<SelectProps<'select', ScalarItems>['itemLabel']>>()
    expectTypeOf<NonNullable<SelectProps<'select', RecordItems>['itemValue']>>().toBeNever()
    expectTypeOf<'name'>().toExtend<NonNullable<SelectProps<'select', ObjectItems, 'id'>['itemLabel']>>()
  })

  test('scalar / record shapes forbid group props; grouped shapes allow them', () => {
    expectTypeOf<NonNullable<SelectProps<'select', ScalarItems>['groupLabel']>>().toBeNever()
    expectTypeOf<NonNullable<SelectProps<'select', ScalarItems>['groupChildren']>>().toBeNever()
    expectTypeOf<NonNullable<SelectProps<'select', RecordItems>['groupConditions']>>().toBeNever()
    expectTypeOf<'children'>().toExtend<NonNullable<SelectProps<'select', GroupItems, 'id', 'children'>['groupChildren']>>()
  })
})
