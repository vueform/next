```ts
/**
 * Model type carried by data props (`modelValue`).
 *
 * Uses indexed access (not `infer` in a conditional) so unbound blueprint
 * `TProps` resolves through its constraint instead of staying opaque.
 */
type ModelOfProps<P> = 'modelValue' extends keyof P
  ? Exclude<P['modelValue'], undefined>
  : any
```
