import type {
  ConditionalProp,
  ConditionsTriggerProp,
} from '~/modules/conditions'
import type { EntryPropOf } from '~/types'
import type { MaybeRef, Ref } from 'vue'

/**
 * Type-only key carrying `ItemsProps` generics for consumers like
 * `MakeItemsReturn<P>`. A `unique symbol`, so it never appears among prop
 * completions. Never set (nor existing) at runtime.
 */
export declare const itemsGenericsBrandKey: unique symbol

/**
 * Resolves the children collection from a group via a `groupChildren` key or
 * mapping function. Returns `never` when the key is not present on the group
 * (so invalid `groupChildren` values do not poison item inference).
 */
type ChildrenOfGroup<TGroup, TGroupChildren> = TGroupChildren extends
  | undefined
  | never
  ? never
  : TGroupChildren extends keyof TGroup
    ? TGroup[TGroupChildren]
    : TGroupChildren extends (group: any) => infer R
      ? R
      : never

/**
 * The raw items data after unwrapping functions and, when grouped, extracting
 * children via `groupChildren`. Falls back to the ungrouped items shape when
 * `groupChildren` is missing or not a valid group key.
 */
type FlatItemsData<TItems, TGroupChildren> = [TGroupChildren] extends [
  undefined | never,
]
  ? UnwrappedItems<TItems>
  : [ChildrenOfGroup<GroupOf<TItems>, TGroupChildren>] extends [never]
    ? UnwrappedItems<TItems>
    : ChildrenOfGroup<GroupOf<TItems>, TGroupChildren>

// =============== HELPERS ===============

/**
 * Whether `T` is a plain object/record map (not an array, function, or string).
 */
type IsPlainRecord<T> = [T] extends [readonly any[]]
  ? false
  : [T] extends [(...args: any) => any]
    ? false
    : [T] extends [object]
      ? [T] extends [string]
        ? false
        : true
      : false

/**
 * String keys available on an item object for `itemValue` / `itemLabel` / etc.
 * Falls back to `string` for non-object items.
 */
type ItemKeyOf<TItem> = [TItem] extends [Record<string, any>]
  ? Extract<keyof TItem, string>
  : string

/**
 * Whether `TItemValueKey` is unset: either explicitly `undefined`, or still a
 * whole-constraint union (`string | undefined` / all item keys) left by an
 * uninferred Vue generic with no default.
 */
type IsUnsetItemValueKey<TItem, TItemValueKey> = [TItemValueKey] extends [
  undefined,
]
  ? true
  : [ItemKeyOf<TItem> | undefined] extends [TItemValueKey]
    ? true
    : false

/**
 * Resolves the selected value from an item given a string key and/or a mapper
 * return type.
 *
 * - Mapper return (`TItemValueReturn`) wins when it is not `unknown`.
 * - Otherwise a concrete string key picks `item[key]`.
 * - Otherwise (both unset) the whole item is used.
 * - A function type in the key slot is also accepted for type-level tests:
 *   `ItemValueOf<Items, (item: Item) => R>`.
 */
type ResolveItemValue<TItem, TItemValueKey, TItemValueReturn> =
  TItemValueKey extends (...args: any) => infer R
    ? R
    : unknown extends TItemValueReturn
      ? IsUnsetItemValueKey<TItem, TItemValueKey> extends true
        ? TItem
        : TItemValueKey extends keyof TItem
          ? TItem[TItemValueKey]
          : any
      : TItemValueReturn

/**
 * Unwraps a `Ref` wrapper that may appear on a registry entry's `items`.
 */
type UnwrapEntryRef<T> = T extends Ref<infer V> ? V : T

/**
 * Widens a literal scalar to its primitive.
 */
type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T

/**
 * Recursively widens an `items` shape: literal scalars become primitives,
 * readonly arrays / tuples become mutable arrays, and object item prop values
 * are widened (keys are preserved, so record-map models and `itemValue` key
 * lookups keep working).
 *
 * Schema `items` are const-narrowed by `defineSchema`'s `const` type parameter
 * (indistinguishable from an explicit `as const`), which would otherwise lock
 * `modelValue` / `default` — and the element's `model` — to the exact item
 * literals. Registry-entry consumers widen instead: `items: [1, 2, 3]` yields a
 * `number` model, not `1 | 2 | 3`.
 */
type WidenItems<T> = T extends (...args: any) => any
  ? T
  : T extends readonly (infer E)[]
    ? WidenItems<E>[]
    : T extends object
      ? { -readonly [K in keyof T]: WidenItems<T[K]> }
      : WidenLiteral<T>

/**
 * Type-parameter payload stored under `itemsGenericsBrandKey`.
 */
export type ItemsGenericsBrandPayload<
  TItems = ItemsProp,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> = {
  items: TItems
  itemValueKey: TItemValueKey
  groupChildren: TGroupChildren
  itemValueReturn: TItemValueReturn
}

/**
 * Type-only brand carrying `ItemsProps` generics for `makeItems` consumers
 * (`extends ItemsProps<infer …>` re-infers a wide `itemValue` union and
 * collapses values to `any`, hence the brand).
 *
 * `ItemsProps` extends this behind a `@vue-ignore` heritage clause: the SFC
 * compiler skips it when generating runtime props (it cannot resolve symbol
 * members), while the type still flows through `defineProps` into the blueprint
 * props. The symbol key keeps it out of prop completions.
 */
export interface ItemsGenericsBrand<
  TItems = ItemsProp,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> {
  [itemsGenericsBrandKey]?: ItemsGenericsBrandPayload<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TItemValueReturn
  >
}

/**
 * Whether `TItems` is still the unconstrained `ItemsProp` default (no concrete
 * items shape has been inferred yet).
 */
export type IsDefaultItems<TItems> = [TItems] extends [ItemsProp]
  ? [ItemsProp] extends [TItems]
    ? true
    : false
  : false

/**
 * Unwraps function and async-function item sources to their resolved data
 * shape.
 */
export type UnwrappedItems<T> = T extends (...args: any[]) => infer R
  ? UnwrappedItems<Awaited<R>>
  : T

/**
 * The group object type extracted from an array of groups.
 */
export type GroupOf<TItems> =
  UnwrappedItems<TItems> extends readonly (infer G)[]
    ? G extends Record<string, any>
      ? G
      : never
    : never

/**
 * The effective raw item type resolved from `items` (and optional
 * `groupChildren`). Handles arrays, object maps, endpoint URLs, and function
 * sources.
 */
export type RawItemOf<TItems, TGroupChildren = undefined> =
  IsDefaultItems<TItems> extends true
    ? any
    : FlatItemsData<TItems, TGroupChildren> extends infer D
      ? D extends string
        ? unknown
        : D extends readonly (infer E)[]
          ? E
          : IsPlainRecord<D> extends true
            ? {
                value: Extract<keyof D, string | number>
                label: D[Extract<keyof D, string | number>]
              }
            : unknown
      : unknown

/**
 * The selected value type derived from `items` and an optional `itemValue` key
 * / mapper return.
 *
 * - Record map → the key type.
 * - Object array with `itemValue` unset → the whole item object (matches runtime
 *   when `itemValue` is omitted).
 * - Object array with a string `itemValue` → `item[itemValue]`.
 * - Object array with a mapper `itemValue` → the mapper's return type.
 * - Scalar array → the scalar type.
 */
export type ItemValueOf<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> =
  IsDefaultItems<TItems> extends true
    ? any
    : UnwrappedItems<TItems> extends string
      ? any
      : IsPlainRecord<UnwrappedItems<TItems>> extends true
        ? Extract<keyof UnwrappedItems<TItems>, string | number>
        : RawItemOf<TItems, TGroupChildren> extends infer Item
          ? Item extends Record<string, any>
            ? ResolveItemValue<Item, TItemValueKey, TItemValueReturn>
            : Item
          : any

/**
 * The model value type for an items-based element. When `items` is an endpoint
 * URL string, `TModel` is used so `v-model` can drive inference; otherwise the
 * value is derived from `items` / `itemValue` / `multiple`.
 */
export type ItemsModel<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> =
  IsDefaultItems<TItems> extends true
    ? TModel
    : UnwrappedItems<TItems> extends string
      ? TModel
      : TMultiple extends true
        ? ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>[]
        : ItemValueOf<
            TItems,
            TItemValueKey,
            TGroupChildren,
            TItemValueReturn
          > | null

/**
 * Model / default prop type for items-based elements.
 *
 * Always includes `NoInfer<ItemsModel<…>>` so `modelValue` / `default` /
 * `v-model` do not compete with `itemValue` (and `items`) when inferring
 * generics. An outer conditional around `NoInfer` (e.g. `IsDefaultItems ?
 * TModel : NoInfer<…>`) is resolved against unbound Vue type parameters and
 * never re-evaluated after inference — which collapsed the prop to `any`.
 *
 * Endpoint URL `items` also union in a naked `TModel` arm so `v-model` can
 * still drive `TModel` when the items shape is a string.
 */
export type ItemsModelProp<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> =
  | NoInfer<
      ItemsModel<
        TItems,
        TItemValueKey,
        TGroupChildren,
        TMultiple,
        TModel,
        TItemValueReturn
      >
    >
  | ([UnwrappedItems<TItems>] extends [string] ? TModel : never)

/**
 * Whether item/group key props are allowed for the given `items` shape.
 *
 * Gates `itemValue`, `itemLabel`, `itemDisabled`, `itemConditions`,
 * `groupLabel`, `groupChildren`, and `groupConditions`.
 *
 * Based on the unwrapped `items` shape only (not `groupChildren`), so an
 * invalid `groupChildren` value cannot disable enforcement of the other key
 * props.
 *
 * - Allowed for arrays of objects, endpoint URLs, and the unconstrained
 *   `ItemsProp` default.
 * - Forbidden for plain scalar arrays and plain object/record maps, which use a
 *   synthetic `{ value, label }` shape at runtime — those key props are not
 *   meaningful there.
 */
export type AllowsItemKeyProps<TItems> =
  IsDefaultItems<TItems> extends true
    ? true
    : UnwrappedItems<TItems> extends infer D
      ? D extends string
        ? true
        : D extends readonly (infer E)[]
          ? E extends Record<string, any>
            ? true
            : false
          : IsPlainRecord<D> extends true
            ? false
            : true
      : true

/**
 * Allowed string keys for `itemValue` on the resolved item shape.
 *
 * Functions are intentionally excluded — they are typed via a separate
 * `TItemValueReturn` generic so the `item` parameter stays concrete (and
 * contextually typed) in inline arrows.
 */
export type AllowedItemValueKey<TItems, TGroupChildren = undefined> = ItemKeyOf<
  RawItemOf<TItems, TGroupChildren>
>

/**
 * Allowed type for item key props (`itemLabel`, `itemDisabled`, etc.) given an
 * item shape. Resolves to `never` when key props are not applicable.
 */
export type ItemKeyProp<TItems, TGroupChildren, TReturn> =
  AllowsItemKeyProps<TItems> extends true
    ?
        | ItemKeyOf<RawItemOf<TItems, TGroupChildren>>
        | ((item: RawItemOf<TItems, TGroupChildren>) => TReturn)
    : never

/**
 * Allowed type for group key props given an items shape. Resolves to `never`
 * for plain scalar arrays and plain object/record maps.
 */
export type GroupKeyProp<TItems, TReturn> =
  AllowsItemKeyProps<TItems> extends true
    ? [GroupOf<TItems>] extends [never]
      ? string | ((group: any) => TReturn)
      :
          | Extract<keyof GroupOf<TItems>, string>
          | ((group: GroupOf<TItems>) => TReturn)
    : never

/**
 * Allowed keys / mappers for `groupChildren`. When the group shape is unknown
 * (e.g. unconstrained `ItemsProp`), fall back to a loose string / mapper so the
 * prop stays assignable to runtime `GroupChildren` (`(group: any) => …`).
 */
export type AllowedGroupChildren<TItems> = [GroupOf<TItems>] extends [never]
  ? string | ((group: any) => any[] | Record<string, any>)
  :
      | Extract<keyof GroupOf<TItems>, string>
      | ((group: GroupOf<TItems>) => any[] | Record<string, any>)

// ========== ENTRY GENERICS ============

/**
 * Raw option items for select, checkbox group, and radio elements, supporting
 * shorthand scalars and full objects. Arrays may be mutable or `readonly` / `as
 * const` tuples so literal unions can drive `modelValue` inference.
 */
export type ItemsProp<TContext = any> =
  | Record<string, string | number>
  | readonly any[]
  | string
  | ((context$: TContext) => any)

/**
 * Bound for the `TItemValueKey` generic of items-based elements: a string item
 * key, or `undefined` when unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `items` shape is enforced by
 * the `itemValue` prop type itself (via `AllowedItemValueKey`), not by this
 * bound.
 */
export type ItemValueProp = string | undefined

/**
 * Bound for the `TGroupChildren` generic of items-based elements: a group key,
 * a function mapping a group to its children, or `undefined` when unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `items` shape is enforced by
 * the `groupChildren` prop type itself (via `AllowedGroupChildren`), not by
 * this bound.
 */
export type GroupChildrenProp =
  | string
  | ((group: any) => any[] | Record<string, any>)
  | undefined

/**
 * Resolves the `TItems` generic from a registry `TEntry` payload's `items`
 * prop, widening const-narrowed literals via `WidenItems` (schema items do not
 * drive literal models). Missing / invalid values fall back to the
 * unconstrained `ItemsProp` (matching SFC generic defaults, so the model stays
 * wide).
 */
export type EntryItemsOf<TEntry> =
  EntryPropOf<TEntry, 'items'> extends infer I
    ? [I] extends [undefined]
      ? ItemsProp
      : WidenItems<UnwrapEntryRef<I>> extends infer U extends ItemsProp
        ? U
        : ItemsProp
    : ItemsProp

/**
 * Resolves the `TItemValueKey` generic from a registry `TEntry` payload's
 * `itemValue` prop — the string-key arm only (mappers are typed via
 * `EntryItemValueReturnOf`).
 */
export type EntryItemValueKeyOf<TEntry> =
  EntryPropOf<TEntry, 'itemValue'> extends infer IV
    ? [IV] extends [undefined]
      ? undefined
      : IV extends string
        ? IV
        : undefined
    : undefined

/**
 * Resolves the `TItemValueReturn` generic from a registry `TEntry` payload's
 * `itemValue` prop — the mapper-return arm (`unknown` = unset).
 */
export type EntryItemValueReturnOf<TEntry> =
  EntryPropOf<TEntry, 'itemValue'> extends (...args: any) => infer R
    ? R
    : unknown

/**
 * Resolves the `TGroupChildren` generic from a registry `TEntry` payload's
 * `groupChildren` prop, coerced to the `GroupChildrenProp` bound.
 */
export type EntryGroupChildrenOf<TEntry> =
  EntryPropOf<TEntry, 'groupChildren'> extends infer G
    ? G extends GroupChildrenProp
      ? G
      : undefined
    : undefined

/**
 * Resolves a `TMultiple` generic from a registry `TEntry` payload's `multiple`
 * prop, defaulting to the component's runtime default when absent or invalid.
 */
export type EntryMultipleOf<TEntry, TDefault extends boolean = false> =
  EntryPropOf<TEntry, 'multiple'> extends infer M
    ? M extends boolean
      ? M
      : TDefault
    : TDefault

// ================ PROPS ================

/**
 * Props for elements that resolve option items from arrays, objects, endpoints,
 * or functions.
 *
 * `itemValue` is split across two generics so Vue can contextually type the
 * mapper's `item` argument from `items` while still inferring the return type
 * into the model:
 *
 * - `TItemValueKey` — string property key
 * - `TItemValueReturn` — mapper return type (defaults to `unknown` = unset)
 */
export interface ItemsProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TItemValueReturn = unknown,
  TContext = any,
> extends /* @vue-ignore */ ItemsGenericsBrand<
  TItems,
  TItemValueKey,
  TGroupChildren,
  TItemValueReturn
> {
  /**
   * The option items for the element.
   */
  items?: MaybeRef<TItems>

  /**
   * Resolves the label for an item. A string key for property lookup, or a
   * function returning the label string. Not allowed for plain scalar arrays or
   * plain object/record maps.
   */
  itemLabel?: ItemKeyProp<TItems, TGroupChildren, string>

  /**
   * Resolves the value for an item. A string key for property lookup, or a
   * function returning the value. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * Typed as `(TItemValueKey & AllowedItemValueKey) | AllowedItemValueKey |
   * ((item) => TItemValueReturn)` so:
   *
   * - string keys infer into `TItemValueKey` through the intersection, which also
   *   rejects keys missing from the item shape (the generic itself is only
   *   bounded by the simple `ItemValueProp`, so validation must happen here)
   * - keys remain assignable on the defaulted `ElementSchema` / `FormSchema`
   *   surface where `TItemValueKey` is still `undefined`
   * - mapper return types infer into `TItemValueReturn`
   * - the `item` parameter stays concrete and is contextually typed even for bare
   *   inline arrows (whose return type cannot drive generics under Vue's
   *   single-pass inference — annotate the param or use a named function for
   *   full model inference)
   */
  itemValue?: AllowsItemKeyProps<TItems> extends true
    ?
        | (TItemValueKey & AllowedItemValueKey<TItems, TGroupChildren>)
        | AllowedItemValueKey<TItems, TGroupChildren>
        | ((item: RawItemOf<TItems, TGroupChildren>) => TItemValueReturn)
    : never

  /**
   * Determines whether an item is disabled. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Not allowed for plain scalar
   * arrays or plain object/record maps.
   */
  itemDisabled?: ItemKeyProp<
    TItems,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Determines whether an item is available. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Items whose conditions are not
   * met are omitted from the list. Not allowed for plain scalar arrays or plain
   * object/record maps.
   */
  itemConditions?: ItemKeyProp<
    TItems,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Resolves the label for a group. A string key for property lookup on the
   * group object, or a function returning the label string. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  groupLabel?: GroupKeyProp<TItems, string>

  /**
   * Resolves the children items for a group. A string key for property lookup
   * on the group object, or a function returning the children in any
   * `ItemsProp` format. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `GroupChildrenProp`). The bare `AllowedGroupChildren` arm keeps keys
   * assignable on the defaulted `ElementSchema` / `FormSchema` surface where
   * `TGroupChildren` is still `undefined`.
   */
  groupChildren?: AllowsItemKeyProps<TItems> extends true
    ?
        | (TGroupChildren & AllowedGroupChildren<TItems>)
        | AllowedGroupChildren<TItems>
    : never

  /**
   * Determines whether a group is available. A string key for property lookup
   * on the group object, or a function returning a `ConditionalProp`. Groups
   * whose conditions are not met are omitted entirely. Not allowed for plain
   * scalar arrays or plain object/record maps.
   */
  groupConditions?: GroupKeyProp<TItems, ConditionalProp<TContext> | undefined>

  /**
   * Custom HTTP headers to include when loading items from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading items from an endpoint. Defaults to
   * `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based items. Accepts an
   * array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based items are only
   * re-resolved when the `items` prop reference itself changes.
   */
  itemsTrigger?: ConditionsTriggerProp<TContext>

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based items when the `itemsTrigger` source changes. Defaults to no
   * debounce (immediate re-resolution).
   */
  itemsDebounce?: number

  /**
   * Transforms data received from an endpoint into the items format. When
   * `items` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   */
  transformItems?: (data: any) => any[] | Record<string, any>
}
