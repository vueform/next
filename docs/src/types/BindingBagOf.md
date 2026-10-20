```ts
/**
 * One part's aggregated binding bag from the already-extracted member types:
 * its binding definition attributes (resolver entries resolved to their
 * returned bags) and its part attribute overrides. Classes are not included —
 * templates bind `:class="classes.x"` alongside.
 */
type BindingBagOf<P, B> = ResolvedAspect<B> & ResolvedAspect<P>
```
