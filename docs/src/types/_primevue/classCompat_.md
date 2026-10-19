```ts
/**
 * Adapts a resolved binding bag for PrimeVue component props by narrowing its
 * `class` to what they accept (`string | object | undefined` — no `null` /
 * `false` ClassValue members), mirroring the old `classes.x || undefined`
 * guard. Passes `undefined` bags through, so the result is `v-bind`-ready.
 *
 * @param bag The part's resolved binding bag, possibly `undefined`.
 */
const classCompat: <T extends { class?: unknown }>(
  bag: T | undefined
) => (T & { class: string | object | undefined }) | undefined
```
