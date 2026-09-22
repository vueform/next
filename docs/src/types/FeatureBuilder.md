```ts
/**
 * Fluent factory chain. Each `.use()` adds one composable whose return is
 * merged into the accumulator; `.build()` returns the merged API.
 *
 * `Acc` is the intersection of factory returns (fed through
 * `ResolveElementType`). `I` is the optional `initial` seed, intersected onto
 * the final result at the top level so unresolved generics on the seed cannot
 * collapse the inferred API.
 */
type FeatureBuilder<
  P,
  E,
  Acc extends Record<string, any> = {},
  I extends Record<string, any> = {},
> = {
  /**
   * Runs a composable with the current accumulated deps and merges its return
   * into the chain.
   *
   * @param fn Factory composable receiving `props`, `events`, and `deps`.
   */
  use: <R extends Record<string, any>>(
    fn: FeatureSlot<P, E, I & Acc, R>
  ) => FeatureBuilder<P, E, Acc & R, I>

  /**
   * Returns the merged factory API.
   */
  build: () => Prettify<ResolveElementType<Acc, P>> & I
}
```
