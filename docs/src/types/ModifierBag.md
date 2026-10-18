```ts
/**
 * Styling attributes for a single DOM part: `data-*` state and variant
 * attributes meant to be applied with a single `v-bind`. Presence attributes
 * carry `''` when active and `undefined` when not (so Vue removes them instead
 * of rendering `"false"`).
 */
type ModifierBag = Record<string, string | number | undefined>
```
