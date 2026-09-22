```ts
/**
 * Model / default prop type for tree-select (NoInfer + endpoint `TModel` arm).
 */
type TreeSelectModelProp<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends string | undefined = undefined,
  TModel = any,
> =
  IsDefaultTreeOptions<TOptions> extends true
    ? TModel
    : TreeKeysModelProp<TOptions, TSelectionMode, TModel>
```
