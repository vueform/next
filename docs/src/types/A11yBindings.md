```ts
/**
 * Part-keyed accessibility bindings of a component. Each key names a DOM part
 * (using the same vocabulary as `parts`/`classes`) and holds the attributes
 * that part must carry — a plain bag, or for per-item parts a function of the
 * item's position returning the bag (resolved at the call site like
 * functional parts). Always keyed by part, even for single-part components,
 * so the shape is uniform across all components.
 */
type A11yBindings<TPart extends string = string> = Partial<
  Record<TPart, A11yBindingBag | ((...args: any[]) => A11yBindingBag)>
>
```
