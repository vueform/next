```ts
/**
 * One part's resolved binding bag, looked up by key across the component's
 * Parts/Bindings interfaces — the slot scope type for a single
 * `bindings` prop, e.g. `PartBindings<'text', VfButtonParts>`. Surfaces that
 * do not carry the key contribute nothing, and functional members resolve to
 * their returned bags, so the same form works for every part.
 *
 * Includes `undefined`: a resolver returns `undefined` when the part
 * currently has nothing to bind (no definition entries and no part override),
 * so the possible absence is part of what a slot receives — call sites never
 * append it.
 *
 * Components whose slots pass several bindings bags should build one private
 * map instead: `type VfXBags = ResolvedBindings<VfXParts, VfXBindings>` and
 * reference `VfXBags['item']` per slot.
 */
type PartBindings<K extends PropertyKey, TParts, TBindings = {}> =
  | BindingBagOf<AspectOf<TParts, K>, AspectOf<TBindings, K>>
  | undefined
```
