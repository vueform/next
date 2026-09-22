```ts
/**
 * Configuration options for `makeModelStore`.
 */
type ModelStoreOptions = {
  /**
   * The initial model object the store takes ownership of. Not cloned — the
   * caller is responsible for passing an owned object.
   */
  model?: Record<string, any>

  /**
   * The null-value tree matching the model's shape, used by `clear()` and the
   * `empty` computed. Dynamic containers (lists, dynamic matrices) appear as
   * arrays holding their initial rows' null values.
   */
  nullModel?: Record<string, any>
}
```
