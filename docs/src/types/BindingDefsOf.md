```ts
/**
 * Def-input shape for a resolved bindings surface: functional keys take their
 * declared resolver, static keys take the bag itself or a zero-argument
 * resolver (laziness is a definition-side freedom — the public `VfXBindings`
 * interfaces always declare the RESOLVED shapes). Patterns annotate their
 * returns with this.
 */
type BindingDefsOf<B> = {
  [K in keyof B]?: B[K] extends (...args: infer A) => infer R
    ? // Parameterized keys: a contribution resolved with the key's call
      // arguments. A partial bag (or nothing) is fine: entries for the same
      // key merge.
      (...args: A) => Partial<R> | null | undefined
    : // Arg-less keys: a zero-argument contribution. Always a function — the
      // resolver runs at the consuming site, so its reactive reads track
      // there.
      () => Partial<B[K]> | null | undefined
}
```
