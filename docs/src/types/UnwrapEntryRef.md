```ts
/**
 * Unwraps a `Ref` wrapper that may appear on a registry entry's `items`.
 */
type UnwrapEntryRef<T> = T extends Ref<infer V> ? V : T
```
