```ts
/**
 * Configuration for the input factory.
 */
type MakeInputConfig = {
  /**
   * Whether the registered input's DOM value is the model's own serialization —
   * i.e. copying the DOM value into the model as-is is always safe. When on
   * (the default), `handleInput` may adopt values resolved from native events,
   * and the registered input gains recovery listeners that pick up value
   * changes no bound event reported (change-only autofill, password managers,
   * the composition trailing edge without `v-model`). Blueprints whose DOM
   * shows a formatted_ representation (masks, formatted dates) must pass
   * `false` — for them the DOM string is display, not data.
   *
   * Accepts a ref/getter so the answer can change at runtime (e.g. a `mask`
   * prop appearing on a text element).
   */
  canonicalDomValue?: MaybeRefOrGetter<boolean>
}
```
