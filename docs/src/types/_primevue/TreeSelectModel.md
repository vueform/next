```ts
/**
 * Resolved model value for a tree-select given `options` + `selectionMode`.
 *
 * Uses `TreeKeysModel` once a concrete options shape is known; falls back to
 * `TModel` for the unconstrained default / endpoint URLs.
 */
type TreeSelectModel<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends string | undefined = undefined,
  TModel = any,
> =
  IsDefaultTreeOptions<TOptions> extends true
    ? TModel
    : TreeKeysModel<TOptions, TSelectionMode, TModel>
```
