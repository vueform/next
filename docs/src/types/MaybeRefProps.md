```ts
/**
 * Widens each form option to also accept a ref or computed, so any option can
 * be reactive.
 */
type MaybeRefProps<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}
```
