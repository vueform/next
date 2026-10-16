```ts
/**
 * Unwraps the inner composable from a `defineFeature` curried signature.
 */
type UnwrapFeature<F> = F extends (config?: any) => infer Next ? Next : F
```
