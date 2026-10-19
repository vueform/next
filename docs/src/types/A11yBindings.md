```ts
/**
 * Part-keyed accessibility bindings of a component — the loose shape the
 * context machinery falls back to when no component-level `VfXA11y` is in
 * scope. Each key names a DOM part (using the same vocabulary as
 * `parts`/`classes`) and holds the attributes that part must carry — a plain
 * bag, or for per-item parts a function of the item's position returning the
 * bag (resolved at the call site like functional parts).
 */
type A11yBindings<TPart extends string = string> = Partial<
  Record<TPart, A11yBindingBag | ((...args: any[]) => A11yBindingBag)>
>
```
