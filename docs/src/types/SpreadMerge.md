```ts
/**
 * Merges two object types where keys from `E` override matching keys in `T`.
 */
type SpreadMerge<T, E> = Omit<T, keyof E> & E
```
