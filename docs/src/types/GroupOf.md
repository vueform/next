```ts
/**
 * The group object type extracted from an array of groups.
 */
type GroupOf<TItems> =
  UnwrappedItems<TItems> extends readonly (infer G)[]
    ? G extends Record<string, any>
      ? G
      : never
    : never
```
