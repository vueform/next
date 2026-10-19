```ts
/**
 * Part-keyed styling modifiers of a component — the loose shape the context
 * machinery falls back to when no component-level `VfXModifiers` is in scope.
 * Each key names a DOM part (using the same vocabulary as `parts`/`classes`)
 * and holds the `data-*` attributes that part must carry — a plain bag, or
 * for per-item parts a function of the item's position/state returning the
 * bag (resolved at the call site like functional parts).
 */
type Modifiers<TPart extends string = string> = Partial<
  Record<TPart, ModifierBag | ((...args: any[]) => ModifierBag)>
>
```
