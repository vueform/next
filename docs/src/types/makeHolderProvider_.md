```ts
/**
 * Provides container context with model mapping and child registration for
 * single- or multi-select holders. Children receive their own configured
 * checked value (`radioValue` / `trueValue`, `true` by default) when selected,
 * and `null` (single) or their `falseValue` (multiple) otherwise. The provider
 * translates between these child values and actual item values.
 *
 * @param config Factory configuration controlling selection mode, child value
 *   prop, and container type.
 */
const makeHolderProvider: (
  config: MakeHolderProviderConfig
) => (options: MakeHolderProviderOptions) => {}
```
