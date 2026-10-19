```ts
/**
 * The attribute namespaces an aspect's bags may carry: modifiers live in the
 * `data-*` namespace; a11y bags carry `aria-*` plus the blessed native
 * attributes that serve the assistive aspect.
 */
type ModifierAttrKeys = `data-${string}`
```
