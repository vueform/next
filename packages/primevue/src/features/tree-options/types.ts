import type { TreeOptionsProp } from '@/types'
import type {
  ConditionsTriggerProp,
  IsDefaultItems,
  UnwrappedItems,
} from '@vueform/core'
import type { MaybeRef } from 'vue'

/**
 * Recursively collects `key` literals from a tree node array.
 */
type TreeKeysOfNodes<T> = T extends readonly (infer N)[]
  ? TreeKeysOfNode<N>
  : never

/**
 * Keys from one tree node and its descendants.
 */
type TreeKeysOfNode<N> =
  | (N extends { key: infer K extends string | number } ? K : never)
  | (N extends { children?: infer C }
      ? C extends readonly any[]
        ? TreeKeysOfNodes<C>
        : never
      : never)

/**
 * Whether `TOptions` is still the unconstrained `TreeOptionsProp` default.
 */
type IsDefaultTreeOptions<TOptions> = [TOptions] extends [TreeOptionsProp]
  ? [TreeOptionsProp] extends [TOptions]
    ? true
    : false
  : false

/**
 * Checkbox selection metadata used by PrimeVue-style tree selection.
 */
export type TreeCheckboxSelectionMeta = {
  checked: boolean
  partialChecked: boolean
}

/**
 * Selection-keys model for a tree of nodes with `key` / `children`.
 *
 * - `selectionMode: 'checkbox'` → `{ [key]?: { checked; partialChecked } }`
 * - otherwise (`single` / `multiple` / unset) → `{ [key]?: true }`
 *
 * Empty selection is `{}` (not `null`). Endpoint / unconstrained items fall
 * back to `TModel`.
 */
export type TreeKeysModel<TOptions, TSelectionMode = undefined, TModel = any> =
  IsDefaultItems<TOptions> extends true
    ? TModel
    : UnwrappedItems<TOptions> extends string
      ? TModel
      : TreeKeysOfNodes<UnwrappedItems<TOptions>> extends infer Keys
        ? [Keys] extends [never]
          ? TModel
          : // Non-distributive check — keep `Partial<Record<K1|K2, …>>` instead of
            // `Partial<Record<K1, …>> | Partial<Record<K2, …>>`.
            [Keys] extends [string | number]
            ? TSelectionMode extends 'checkbox'
              ? Partial<
                  Record<Keys & (string | number), TreeCheckboxSelectionMeta>
                >
              : Partial<Record<Keys & (string | number), true>>
            : TModel
        : TModel

/**
 * Model / default prop type for tree-keys elements.
 *
 * Always includes `NoInfer<TreeKeysModel<…>>` so `modelValue` / `default` do
 * not compete with `options` / `selectionMode` when inferring generics.
 * Endpoint URL items also union in a naked `TModel` arm so `v-model` can still
 * drive `TModel`.
 */
export type TreeKeysModelProp<
  TOptions,
  TSelectionMode = undefined,
  TModel = any,
> =
  | NoInfer<TreeKeysModel<TOptions, TSelectionMode, TModel>>
  | ([UnwrappedItems<TOptions>] extends [string] ? TModel : never)

/**
 * Bound for the `TSelectionMode` generic of tree-select elements: one of
 * PrimeVue's tree selection modes, or `undefined` when unset.
 *
 * Intentionally limited to the literal modes so a component instance's props
 * stay assignable to the component's canonical (defaulted) context.
 */
export type TreeSelectionModeProp =
  'single' | 'multiple' | 'checkbox' | undefined

/**
 * Resolved model value for a tree-select given `options` + `selectionMode`.
 *
 * Uses `TreeKeysModel` once a concrete options shape is known; falls back to
 * `TModel` for the unconstrained default / endpoint URLs.
 */
export type TreeSelectModel<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends string | undefined = undefined,
  TModel = any,
> =
  IsDefaultTreeOptions<TOptions> extends true
    ? TModel
    : TreeKeysModel<TOptions, TSelectionMode, TModel>

/**
 * Model / default prop type for tree-select (NoInfer + endpoint `TModel` arm).
 */
export type TreeSelectModelProp<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends string | undefined = undefined,
  TModel = any,
> =
  IsDefaultTreeOptions<TOptions> extends true
    ? TModel
    : TreeKeysModelProp<TOptions, TSelectionMode, TModel>

/**
 * Props for PrimeVue tree-select-style elements (`options` only — no
 * `optionValue` / `optionLabel`). Model typing uses `TreeSelectModel`.
 */
export interface TreeOptionsProps<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
> {
  /**
   * The tree option items for the tree-select element. Accepts a static array
   * of tree nodes, an endpoint URL string, or a function returning tree nodes
   * (sync or async).
   */
  options?: MaybeRef<TOptions>

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
   * Transforms data received from an endpoint into the tree node array format.
   * When `options` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   */
  transformOptions?: (data: any) => any[]
}
