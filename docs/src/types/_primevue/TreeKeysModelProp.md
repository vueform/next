```ts
/**
 * Model / default prop type for tree-keys elements.
 *
 * Always includes `NoInfer<TreeKeysModel<…>>` so `modelValue` / `default` do
 * not compete with `options` / `selectionMode` when inferring generics.
 * Endpoint URL items also union in a naked `TModel` arm so `v-model` can still
 * drive `TModel`.
 */
type TreeKeysModelProp<TOptions, TSelectionMode = undefined, TModel = any> =
  | NoInfer<TreeKeysModel<TOptions, TSelectionMode, TModel>>
  | ([UnwrappedItems<TOptions>] extends [string] ? TModel : never)
```
