/*
 * Compile-time assertions for items → modelValue inference. This file is not
 * imported at runtime; vue-tsc / tsc validates it.
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
import type { ExpressionString, GroupChildrenProp, ItemsModel, ItemValueOf, ItemsProp, RawItemOf } from '@vueform/core'
import type { SelectProps } from '@vueform/core/blueprints/select'
import type { VfSelectProps } from '@vueform/core/components/VfSelect'

type Expect<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
/**
 * `NoInfer` is transparent for `extends` but not for `Equal`.
 */
type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

/*
 * `AllowsItemKeyProps` / `AllowedItemValueKey` / `AllowedGroupChildren` are
 * module-private in `features/items`, so recover them here from the public
 * `SelectProps` prop types they gate (`itemValue` / `groupChildren`) —
 * the assertions below then also exercise the user-visible prop surface.
 */
type AllowsItemKeyProps<TItems extends ItemsProp> = [NonNullable<SelectProps<'select', TItems>['itemValue']>] extends [never] ? false : true
type AllowedItemValueKey<TItems extends ItemsProp, TGroupChildren extends GroupChildrenProp = undefined> = Extract<NonNullable<SelectProps<'select', TItems, undefined, TGroupChildren>['itemValue']>, string>
type AllowedGroupChildren<TItems extends ItemsProp> = NonNullable<SelectProps<'select', TItems>['groupChildren']>

// ============ Scalar array ============

type ScalarItems = ('a' | 'b')[]
type _scalarItem = Expect<Equal<RawItemOf<ScalarItems>, 'a' | 'b'>>
type _scalarValue = Expect<Equal<ItemValueOf<ScalarItems>, 'a' | 'b'>>
type _scalarModel = Expect<Equal<ItemsModel<ScalarItems>, 'a' | 'b' | null>>
type _scalarMulti = Expect<Equal<ItemsModel<ScalarItems, 'value', undefined, true>, ('a' | 'b')[]>>

// ============ Readonly / as const scalar tuple ============

type ConstItems = readonly ['foo', 'bar', 'baz']
type _constItem = Expect<Equal<RawItemOf<ConstItems>, 'foo' | 'bar' | 'baz'>>
type _constValue = Expect<Equal<ItemValueOf<ConstItems>, 'foo' | 'bar' | 'baz'>>
type _constModel = Expect<Equal<ItemsModel<ConstItems>, 'foo' | 'bar' | 'baz' | null>>
type _constSelectModel = Expect<MutuallyAssignable<SelectProps<'select', ConstItems>['modelValue'], 'foo' | 'bar' | 'baz' | null | undefined>>
type _constWrongModel = Expect<Equal<string extends NonNullable<SelectProps<'select', ConstItems>['modelValue']> ? true : false, false>>

// ============ Object array + itemValue key ============

type ObjectItem = { id: number; name: string }
type ObjectItems = ObjectItem[]
type _objectItem = Expect<Equal<RawItemOf<ObjectItems>, ObjectItem>>
type _objectValue = Expect<Equal<ItemValueOf<ObjectItems, 'id'>, number>>
type _objectModel = Expect<Equal<ItemsModel<ObjectItems, 'id'>, number | null>>
type _objectMulti = Expect<Equal<ItemsModel<ObjectItems, 'id', undefined, true>, number[]>>
type _objectDefaultValue = Expect<Equal<ItemValueOf<ObjectItems>, ObjectItem>>

// Object array with a `value` key still uses the whole object when itemValue
// is unset; only an explicit itemValue:"value" picks the property.
type LabelItem = { value: string; label: string }
type LabelItems = LabelItem[]
type _labelUnsetValue = Expect<Equal<ItemValueOf<LabelItems>, LabelItem>>
type _labelExplicitValue = Expect<Equal<ItemValueOf<LabelItems, 'value'>, string>>
type _labelUnsetModel = Expect<Equal<ItemsModel<LabelItems>, LabelItem | null>>
type _labelSelectUnsetModel = Expect<MutuallyAssignable<SelectProps<'select', LabelItems>['modelValue'], LabelItem | null | undefined>>
type _labelSelectExplicitModel = Expect<MutuallyAssignable<SelectProps<'select', LabelItems, 'value'>['modelValue'], string | null | undefined>>
type _labelSelectRejectsStringModel = Expect<Equal<string extends NonNullable<SelectProps<'select', LabelItems>['modelValue']> ? true : false, false>>

// ============ Record map ============

type RecordItems = { x: string; y: string }
type _recordItem = Expect<Equal<RawItemOf<RecordItems>, { value: 'x' | 'y'; label: string }>>
type _recordValue = Expect<Equal<ItemValueOf<RecordItems>, 'x' | 'y'>>
type _recordModel = Expect<Equal<ItemsModel<RecordItems>, 'x' | 'y' | null>>

// ============ Function source ============

type FnItems = () => ObjectItem[]
type _fnItem = Expect<Equal<RawItemOf<FnItems>, ObjectItem>>
type _fnValue = Expect<Equal<ItemValueOf<FnItems, 'id'>, number>>

type AsyncFnItems = () => Promise<ObjectItem[]>
type _asyncFnValue = Expect<Equal<ItemValueOf<AsyncFnItems, 'id'>, number>>

// ============ Grouped ============

type Group = { label: string; children: ObjectItem[] }
type GroupItems = Group[]
type _groupItem = Expect<Equal<RawItemOf<GroupItems, 'children'>, ObjectItem>>
type _groupValue = Expect<Equal<ItemValueOf<GroupItems, 'id', 'children'>, number>>

// ============ Endpoint string ============

type _endpointModel = Expect<Equal<ItemsModel<string, 'value', undefined, false, number | null>, number | null>>

// ============ itemValue function ============

type _fnItemValue = Expect<Equal<ItemValueOf<ObjectItems, (item: ObjectItem) => string>, string>>
type _fnItemValueReturn = Expect<Equal<ItemValueOf<ObjectItems, undefined, undefined, string>, string>>

// Inference from an itemValue mapper must win over a simultaneous modelValue
// binding (NoInfer on the model prop), otherwise the value generics stay
// unset and the model is typed as the whole item object.
function inferSelectProps<TItems extends ObjectItems, TItemValueKey extends AllowedItemValueKey<TItems> | undefined = undefined, TItemValueReturn = unknown>(
  p: SelectProps<'select', TItems, TItemValueKey, undefined, false, any, TItemValueReturn>
): SelectProps<'select', TItems, TItemValueKey, undefined, false, any, TItemValueReturn>['modelValue'] {
  return p.modelValue
}

const _inferredFnModel = inferSelectProps({
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
type _inferredFnModelType = Expect<MutuallyAssignable<typeof _inferredFnModel, string | null | undefined>>

const _inferredKeyModel = inferSelectProps({
  name: 'x',
  items: [{ id: 1, name: 'Foo' }],
  itemValue: 'id',
  modelValue: 1,
})
type _inferredKeyModelType = Expect<MutuallyAssignable<typeof _inferredKeyModel, number | null | undefined>>

// ============ Blueprint / component props ============

type _selectModel = Expect<Equal<ItemsModel<ObjectItems, 'id'>, number | null>>
type _selectMultiModel = Expect<Equal<ItemsModel<ObjectItems, 'id', undefined, true>, number[]>>

type SelectWithObjects = SelectProps<'select', ObjectItems, 'id'>
type _selectPropsModel = Expect<MutuallyAssignable<SelectWithObjects['modelValue'], number | null | undefined>>
// `default` is expressionable, so it also accepts `{...}` expression strings.
type _selectPropsDefault = Expect<MutuallyAssignable<SelectWithObjects['default'], number | null | undefined | ExpressionString>>

type VfSelectWithObjects = VfSelectProps<ObjectItems, 'id'>
type _vfSelectModel = Expect<MutuallyAssignable<VfSelectWithObjects['modelValue'], number | null | undefined>>

// Valid itemValue keys remain assignable; invalid keys are rejected by the
// TItemValueKey / TGroupChildren constraints (and itemLabel's key union).
type ValidItemValue = NonNullable<SelectProps<'select', ObjectItems, 'id'>['itemValue']>
type _validKey = Expect<Equal<'id' extends ValidItemValue ? true : false, true>>
type _invalidKey = Expect<Equal<'nope' extends AllowedItemValueKey<ObjectItems> ? true : false, false>>

type _labelItemRejectsBadValue = Expect<Equal<'not_value' extends AllowedItemValueKey<LabelItems> ? true : false, false>>
type _labelItemRejectsBadLabel = Expect<Equal<'not_label' extends NonNullable<SelectProps<'select', LabelItems>['itemLabel']> ? true : false, false>>
type _labelItemRejectsBadGroupChildren = Expect<Equal<'not_items' extends AllowedGroupChildren<LabelItems> ? true : false, false>>

// ============ Key props forbidden for synthetic shapes ============

type _scalarAllowsKeys = Expect<Equal<AllowsItemKeyProps<ScalarItems>, false>>
type _recordAllowsKeys = Expect<Equal<AllowsItemKeyProps<RecordItems>, false>>
type _objectAllowsKeys = Expect<Equal<AllowsItemKeyProps<ObjectItems>, true>>
type _groupAllowsKeys = Expect<Equal<AllowsItemKeyProps<GroupItems>, true>>
type _endpointAllowsKeys = Expect<Equal<AllowsItemKeyProps<string>, true>>
type _fnObjectAllowsKeys = Expect<Equal<AllowsItemKeyProps<FnItems>, true>>
type _fnScalarAllowsKeys = Expect<Equal<AllowsItemKeyProps<() => ('a' | 'b')[]>, false>>

type _scalarForbidsItemValue = Expect<Equal<[NonNullable<SelectProps<'select', ScalarItems>['itemValue']>] extends [never] ? true : false, true>>
// Scalar arrays reject string-key lookup but still allow function mappers,
// which receive the synthetic `{ value, label }` item.
type _scalarForbidsItemLabelKey = Expect<Equal<'label' extends NonNullable<SelectProps<'select', ScalarItems>['itemLabel']> ? true : false, false>>
type _scalarAllowsItemLabelMapper = Expect<Equal<((item: any) => string) extends NonNullable<SelectProps<'select', ScalarItems>['itemLabel']> ? true : false, true>>
type _recordForbidsItemValue = Expect<Equal<[NonNullable<SelectProps<'select', RecordItems>['itemValue']>] extends [never] ? true : false, true>>
type _objectAllowsItemLabel = Expect<Equal<'name' extends NonNullable<SelectProps<'select', ObjectItems, 'id'>['itemLabel']> ? true : false, true>>

type _scalarForbidsGroupLabel = Expect<Equal<[NonNullable<SelectProps<'select', ScalarItems>['groupLabel']>] extends [never] ? true : false, true>>
type _scalarForbidsGroupChildren = Expect<Equal<[NonNullable<SelectProps<'select', ScalarItems>['groupChildren']>] extends [never] ? true : false, true>>
type _recordForbidsGroupConditions = Expect<Equal<[NonNullable<SelectProps<'select', RecordItems>['groupConditions']>] extends [never] ? true : false, true>>
type _groupAllowsGroupChildren = Expect<Equal<'children' extends NonNullable<SelectProps<'select', GroupItems, 'id', 'children'>['groupChildren']> ? true : false, true>>

export {}
