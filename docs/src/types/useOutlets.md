```ts
/**
 * Builds the standard outlets map every Vueform component exposes as
 * `context.outlets`: inline Vue template slots merged with normalized
 * prop-based slot overrides, plus the component template resolved into
 * `outlets.template`. Inline slots take priority over prop-based ones.
 *
 * @param options Outlet resolution options.
 */
function useOutlets(options: UseOutletsOptions): UseOutletsReturn
```
