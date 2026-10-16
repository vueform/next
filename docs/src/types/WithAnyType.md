```ts
/**
 * Replaces the `type` property of `T` with `any`, allowing any element type
 * string.
 */
type WithAnyType<T> = Omit<T, 'type'> & { type?: any }
```
