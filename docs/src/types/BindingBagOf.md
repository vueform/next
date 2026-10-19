```ts
/**
 * One part's aggregated binding bag from the already-extracted member types:
 * its modifier and a11y attributes, its part attribute overrides (functional
 * members resolved to their returned bags), and its resolved classes under
 * `class` (merged, never replaced, with part-level `class` overrides).
 */
type BindingBagOf<P, M, A> = Omit<
  ResolvedAspect<M> & ResolvedAspect<A> & ResolvedAspect<P>,
  'class'
> & {
  /**
   * The part's resolved CSS classes, including part-level `class` overrides.
   */
  class?: ClassValue
}
```
