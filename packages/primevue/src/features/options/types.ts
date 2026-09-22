import type {
  AllowedItemValueKey,
  AllowsItemKeyProps,
  ConditionalProp,
  ConditionsTriggerProp,
  EntryItemsOf,
  EntryItemValueKeyOf,
  EntryItemValueReturnOf,
  EntryPropOf,
  GroupKeyProp,
  GroupOf,
  ItemKeyProp,
  ItemsGenericsBrand,
  ItemValueOf,
  ItemValueProp,
  ItemsModel,
  ItemsModelApi,
  ItemsModelProp,
  ItemsProp,
  RawItemOf,
  ResolvedItem,
} from '@vueform/core'
import type { MaybeRef } from 'vue'

/**
 * Allowed types for the `options` prop. PrimeVue-named counterpart of core
 * `ItemsProp`.
 */
export type OptionsProp<TContext = any> = ItemsProp<TContext>

/**
 * Bound for the `TOptionValueKey` generic of options-based elements: a string
 * option key, or `undefined` when unset.
 *
 * PrimeVue-named counterpart of core `ItemValueProp`.
 */
export type OptionValueProp = ItemValueProp

/**
 * Allowed type for option key props (`optionLabel`, `optionDisabled`, etc.).
 * PrimeVue-named counterpart of core `ItemKeyProp`.
 */
export type OptionKeyProp<TOptions, TGroupChildren, TReturn> = ItemKeyProp<
  TOptions,
  TGroupChildren,
  TReturn
>

/**
 * Allowed string keys for `optionValue` on the resolved option shape.
 * PrimeVue-named counterpart of core `AllowedItemValueKey`.
 */
export type AllowedOptionValueKey<
  TOptions,
  TGroupChildren = undefined,
> = AllowedItemValueKey<TOptions, TGroupChildren>

/**
 * Whether option/group key props are allowed for the given `options` shape.
 * PrimeVue-named counterpart of core `AllowsItemKeyProps`.
 */
export type AllowsOptionKeyProps<TOptions> = AllowsItemKeyProps<TOptions>

/**
 * The effective raw option type resolved from `options` (and optional
 * `optionGroupChildren`). PrimeVue-named counterpart of core `RawItemOf`.
 */
export type RawOptionOf<TOptions, TGroupChildren = undefined> = RawItemOf<
  TOptions,
  TGroupChildren
>

/**
 * The selected value type derived from `options` and an optional `optionValue`
 * key / mapper return. PrimeVue-named counterpart of core `ItemValueOf`.
 */
export type OptionValueOf<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TOptionValueReturn = unknown,
> = ItemValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>

/**
 * The group object type extracted from an array of groups. PrimeVue-named
 * counterpart of core `GroupOf`.
 */
export type OptionGroupOf<TOptions> = GroupOf<TOptions>

/**
 * Allowed type for option-group key props. PrimeVue-named counterpart of core
 * `GroupKeyProp`.
 */
export type OptionGroupKeyProp<TOptions, TReturn> = GroupKeyProp<
  TOptions,
  TReturn
>

/**
 * The model value type for an options-based element. PrimeVue-named counterpart
 * of core `ItemsModel`.
 */
export type OptionsModel<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> = ItemsModel<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn
>

/**
 * Model / default prop type for options-based elements. PrimeVue-named
 * counterpart of core `ItemsModelProp`.
 */
export type OptionsModelProp<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> = ItemsModelProp<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn
>

/**
 * Factory API overlay that specializes model members from options generics.
 * PrimeVue-named counterpart of core `ItemsModelApi`.
 */
export type OptionsModelApi<Base, P> = ItemsModelApi<Base, P>

/**
 * Type-only brand carrying `OptionsProps` generics for `makeItems` consumers.
 * PrimeVue-named counterpart of core `ItemsGenericsBrand`.
 */
export type OptionsGenericsBrand<
  TOptions = OptionsProp,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TOptionValueReturn = unknown,
> = ItemsGenericsBrand<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TOptionValueReturn
>

/**
 * A normalized option with resolved value, label, and disabled state.
 * PrimeVue-named counterpart of core `ResolvedItem`.
 */
export type ResolvedOption<
  TValue = any,
  TRaw = Record<string, any>,
> = ResolvedItem<TValue, TRaw>

/**
 * Remaps PrimeVue option prop names on a registry `TEntry` payload to the core
 * items keys that the core `Entry*Of` helpers read (`options` → `items`,
 * `optionValue` → `itemValue`, `optionGroupChildren` → `groupChildren`).
 *
 * Prefer the PrimeVue-named wrappers (`EntryOptionsOf`,
 * `EntryOptionValueKeyOf`, `EntryOptionValueReturnOf`,
 * `EntryOptionGroupChildrenOf`) at call sites.
 */
export type OptionsEntry<TEntry> = {
  items: EntryPropOf<TEntry, 'options'>
  itemValue: EntryPropOf<TEntry, 'optionValue'>
  groupChildren: EntryPropOf<TEntry, 'optionGroupChildren'>
}

/**
 * Resolves the `TOptions` generic from a registry `TEntry` payload's `options`
 * prop — the PrimeVue-named counterpart of core `EntryItemsOf`.
 */
export type EntryOptionsOf<TEntry> = EntryItemsOf<OptionsEntry<TEntry>>

/**
 * Resolves the `TOptionValueKey` generic from a registry `TEntry` payload's
 * `optionValue` prop — the string-key arm only (mapper returns are typed via
 * `EntryOptionValueReturnOf`). The PrimeVue-named counterpart of core
 * `EntryItemValueKeyOf`.
 */
export type EntryOptionValueKeyOf<TEntry> = EntryItemValueKeyOf<
  OptionsEntry<TEntry>
>

/**
 * Resolves the `TOptionValueReturn` generic from a registry `TEntry` payload's
 * `optionValue` prop — the mapper-return arm (`unknown` = unset). The
 * PrimeVue-named counterpart of core `EntryItemValueReturnOf`.
 */
export type EntryOptionValueReturnOf<TEntry> = EntryItemValueReturnOf<
  OptionsEntry<TEntry>
>

/**
 * Resolves the `TGroupChildren` generic from a registry `TEntry` payload's
 * `optionGroupChildren` prop, coerced to `TBound`. The PrimeVue-named
 * counterpart of core `EntryGroupChildrenOf`.
 *
 * Cascade-select elements pass `CascadeOptionGroupChildrenProp` as `TBound` to
 * also admit nested path arrays.
 */
export type EntryOptionGroupChildrenOf<
  TEntry,
  TBound = OptionGroupChildrenProp,
> =
  EntryPropOf<TEntry, 'optionGroupChildren'> extends infer G
    ? G extends TBound
      ? G
      : undefined
    : undefined

/**
 * Allowed keys / mappers for `optionGroupChildren`.
 *
 * Same as core `AllowedGroupChildren`, except mapper returns are restricted to
 * arrays — PrimeVue's Select (and related) `optionGroupChildren` prop only
 * accepts `any[]`, not record maps.
 */
export type AllowedOptionGroupChildren<TOptions> = [
  OptionGroupOf<TOptions>,
] extends [never]
  ? string | ((group: any) => any[])
  : | Extract<keyof OptionGroupOf<TOptions>, string>
    | ((group: OptionGroupOf<TOptions>) => any[])

/**
 * Bound for the `TGroupChildren` generic of options-based elements: a group
 * key, a function mapping a group to a children array, or `undefined` when
 * unset.
 *
 * Intentionally simple so component `generic="…"` declarations stay readable.
 * Whether a key is actually valid for the current `options` shape is enforced
 * by the `optionGroupChildren` prop type itself (via
 * `AllowedOptionGroupChildren`), not by this bound.
 */
export type OptionGroupChildrenProp =
  string | ((group: any) => any[]) | undefined

/**
 * CascadeSelect also accepts a nested path array (e.g. `['states', 'cities']`)
 * for `optionGroupChildren`.
 */
export type AllowedCascadeOptionGroupChildren<TOptions> =
  AllowedOptionGroupChildren<TOptions> | string[]

/**
 * Bound for the `TGroupChildren` generic of cascade-select elements: a group
 * key, a nested path array, a function mapping a group to a children array, or
 * `undefined` when unset.
 *
 * The cascade counterpart of `OptionGroupChildrenProp` — intentionally simple
 * so component `generic="…"` declarations stay readable. Whether a key or path
 * is actually valid for the current `options` shape is enforced by the
 * `optionGroupChildren` prop type itself (via
 * `AllowedCascadeOptionGroupChildren`), not by this bound.
 */
export type CascadeOptionGroupChildrenProp =
  string | string[] | ((group: any) => any[]) | undefined

/**
 * Props for PrimeVue options-based elements (`options` / `option*` naming).
 *
 * Same generics and inference rules as core `ItemsProps`, with PrimeVue prop
 * names. Model typing uses `OptionsModel` / `OptionsModelProp`.
 *
 * `optionValue` is split across two generics so Vue can contextually type the
 * mapper's `option` argument from `options` while still inferring the return
 * type into the model:
 *
 * - `TOptionValueKey` — string property key
 * - `TOptionValueReturn` — mapper return type (defaults to `unknown` = unset)
 */
export interface OptionsProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TOptionValueReturn = unknown,
  TContext = any,
> {
  /**
   * The option items for the element.
   */
  options?: MaybeRef<TOptions>

  /**
   * Resolves the label for an option. A string key for property lookup, or a
   * function returning the label string. Not allowed for plain scalar arrays or
   * plain object/record maps.
   */
  optionLabel?: OptionKeyProp<TOptions, TGroupChildren, string>

  /**
   * Resolves the value for an option. A string key for property lookup, or a
   * function returning the value. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * Typed as `(TOptionValueKey & AllowedOptionValueKey) | AllowedOptionValueKey
   *
   * | ((option) => TOptionValueReturn)` so:
   *
   * - string keys infer into `TOptionValueKey` through the intersection, which
   *   also rejects keys missing from the option shape (the generic itself is
   *   only bounded by the simple `OptionValueProp`, so validation must happen
   *   here)
   * - keys remain assignable on the defaulted `ElementSchema` / `FormSchema`
   *   surface where `TOptionValueKey` is still `undefined`
   * - mapper return types infer into `TOptionValueReturn`
   * - the `option` parameter stays concrete and is contextually typed even for
   *   bare inline arrows (whose return type cannot drive generics under Vue's
   *   single-pass inference — annotate the param or use a named function for
   *   full model inference)
   */
  optionValue?: AllowsOptionKeyProps<TOptions> extends true
    ? | (TOptionValueKey & AllowedOptionValueKey<TOptions, TGroupChildren>)
      | AllowedOptionValueKey<TOptions, TGroupChildren>
      | ((option: RawOptionOf<TOptions, TGroupChildren>) => TOptionValueReturn)
    : never

  /**
   * Determines whether an option is disabled. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Not allowed for plain scalar
   * arrays or plain object/record maps.
   */
  optionDisabled?: OptionKeyProp<
    TOptions,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Determines whether an option is available. A string key for property
   * lookup, or a function returning a `ConditionalProp`. Options whose
   * conditions are not met are omitted from the list. Not allowed for plain
   * scalar arrays or plain object/record maps.
   */
  optionConditions?: OptionKeyProp<
    TOptions,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Resolves the label for an option group. A string key for property lookup on
   * the group object, or a function returning the label string. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  optionGroupLabel?: OptionGroupKeyProp<TOptions, string>

  /**
   * Resolves the children items for an option group. A string key for property
   * lookup on the group object, or a function returning a children array. Not
   * allowed for plain scalar arrays or plain object/record maps.
   *
   * Mapper returns are restricted to arrays to match PrimeVue's
   * `optionGroupChildren` prop.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `OptionGroupChildrenProp`). The bare `AllowedOptionGroupChildren`
   * arm keeps keys assignable on the defaulted schema surface where
   * `TGroupChildren` is still `undefined`.
   */
  optionGroupChildren?: AllowsOptionKeyProps<TOptions> extends true
    ? | (TGroupChildren & AllowedOptionGroupChildren<TOptions>)
      | AllowedOptionGroupChildren<TOptions>
    : never

  /**
   * Determines whether an option group is available. A string key for property
   * lookup on the group object, or a function returning a `ConditionalProp`.
   * Groups whose conditions are not met are omitted entirely. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  optionGroupConditions?: OptionGroupKeyProp<
    TOptions,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Custom HTTP headers to include when loading options from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading options from an endpoint. Defaults to
   * `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based options. Accepts
   * an array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based options are only
   * re-resolved when the `options` prop reference itself changes.
   */
  optionsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based options when the `optionsTrigger` source changes. Defaults
   * to no debounce (immediate re-resolution).
   */
  optionsDebounce?: number

  /**
   * Transforms data received from an endpoint into the options format. When
   * `options` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   */
  transformOptions?: (data: any) => any[] | Record<string, any>
}
