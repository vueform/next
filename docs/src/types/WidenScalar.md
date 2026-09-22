```ts
/**
 * Widens a literal scalar to its primitive. Selection values follow the `items`
 * convention: const-narrowed schema literals must not lock the model.
 */
type WidenScalar<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T
```
