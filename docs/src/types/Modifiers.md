```ts
/**
 * Part-keyed styling modifiers of a component. Each key names a DOM part
 * (using the same vocabulary as `parts`/`classes`) and holds the `data-*`
 * attributes that part must carry — a plain bag, or for per-item parts a
 * function of the item's position/state returning the bag (resolved at the
 * call site like functional parts). Always keyed by part, even for
 * single-part components, so the shape is uniform across all components.
 */
type Modifiers<TPart extends string = string> = Partial<
  Record<TPart, ModifierBag | ((...args: any[]) => ModifierBag)>
>
```
