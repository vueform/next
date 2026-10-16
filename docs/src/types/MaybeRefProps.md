```ts
/**
 * Widens each form option to also accept a ref or computed — `useForm` unwraps
 * them at render time, so any option can be reactive.
 */
type MaybeRefProps<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}
```
