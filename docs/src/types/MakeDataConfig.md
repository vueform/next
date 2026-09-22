```ts
/**
 * Config flags for makeData controlling which optional return-type groups are
 * excluded. By default (no config), all groups are included.
 */
type MakeDataConfig = {
  /**
   * When `true`, repeatable-only keys (`items`, `dragIndex`, `dropIndex`,
   * `add`, `remove`, `sort`) are excluded from the return type.
   */
  repeatable?: true

  /**
   * When `true`, translatable-only keys (`currentValidation`,
   * `invalidLanguages`, `validateCurrent`) are excluded from the return type.
   */
  translatable?: true

  /**
   * When set, the model value is cast to the specified type before being stored
   * or read. Values that are `null` or `undefined` are not cast.
   */
  cast?: CastOption
}
```
