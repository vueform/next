```ts
/**
 * Resolves the return type of a factory, including those created with
 * `defineFeature` which use a curried `(config?) => (options) => result`
 * signature.
 */
type FeatureReturn<F> =
  UnwrapFeature<F> extends (options: any) => infer R
    ? R
    : UnwrapFeature<F> extends (...args: any[]) => infer R
      ? R
      : never
```
