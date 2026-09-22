```ts
/**
 * Returns a typed helper function for declaring component prop defaults
 * inferred from the given props type.
 *
 * Curried on purpose: TypeScript cannot partially infer remaining type
 * parameters, so `TProps` must be fixed in a first call while the defaults
 * object (and its precise `const` shape) is inferred in a second. A single
 * `defineDefaults<TProps>(…)` call would widen the return to
 * `InferDefaults<TProps>`, which breaks Vue `withDefaults` on generic SFCs.
 */
function defineDefaults<TProps>(): <
  const TDefaults extends InferDefaults<TProps>,
>(
  defaults: TDefaults
) => TDefaults
```
