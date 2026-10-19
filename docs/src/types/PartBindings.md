```ts
/**
 * One part's resolved binding bag, looked up by key across the component's
 * Parts/Modifiers/A11y interfaces — the slot scope type for a single
 * `bindings` prop, e.g. `PartBindings<'text', VfButtonParts>`. Surfaces that
 * do not carry the key contribute nothing, and functional members resolve to
 * their returned bags, so the same form works for every part.
 *
 * Includes `undefined`: the aggregate hands a slot `undefined` when the part
 * currently has nothing to bind (no modifier/a11y bag, no part override, and
 * classes resolving to nothing), so the possible absence is part of what a
 * slot receives — call sites never append it.
 *
 * Components whose slots pass several bindings bags should build one private
 * map instead: `type VfXBindings = ResolvedBindings<VfXParts, VfXModifiers,
 * VfXA11y>` and reference `VfXBindings['item']` per slot.
 */
type PartBindings<K extends PropertyKey, TParts, TModifiers = {}, TA11y = {}> =
  | BindingBagOf<
      AspectOf<TParts, K>,
      AspectOf<TModifiers, K>,
      AspectOf<TA11y, K>
    >
  | undefined
```
