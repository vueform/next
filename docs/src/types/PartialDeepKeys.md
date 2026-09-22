```ts
/**
 * Makes all keys of `T` optional, while also making the members of keys in `K`
 * individually optional (one-level deep partial).
 */
type PartialDeepKeys<T, K extends keyof T> = Partial<Omit<T, K>> & {
  [P in K]?: Partial<T[P]>
}
```
