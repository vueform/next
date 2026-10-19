```ts
/**
 * Every part's resolved binding bag, keyed like the component's `bindings`
 * aggregate — the building block for a component's private `VfXBindings`
 * alias (see `PartBindings`).
 */
type ResolvedBindings<TParts, TModifiers = {}, TA11y = {}> = {
  [K in keyof TParts | keyof TModifiers | keyof TA11y]: PartBindings<
    K,
    TParts,
    TModifiers,
    TA11y
  >
}
```
