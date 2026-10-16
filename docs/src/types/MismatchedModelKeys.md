```ts
/**
 * Keys of the (null-stripped) Standard Schema input that are missing from, or
 * structurally incompatible with, the (null-stripped) model shape. The input
 * may be narrower than the model (e.g. `z.enum(['a'])` against a `string`
 * model) — the model being narrower is a mismatch.
 */
type MismatchedModelKeys<SM, SI> = {
  [K in keyof SI]-?: K extends keyof SM
    ? [SI[K]] extends [SM[K]]
      ? never
      : K
    : K
}[keyof SI]
```
