```ts
/**
 * Evaluates to `true` if the type `T` is a union, `false` if it is a single
 * type.
 */
type IsUnion<T, U = T> = T extends any
  ? [U] extends [T]
    ? false
    : true
  : never
```
