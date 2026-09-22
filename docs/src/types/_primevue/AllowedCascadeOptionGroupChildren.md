```ts
/**
 * CascadeSelect also accepts a nested path array (e.g. `['states', 'cities']`)
 * for `optionGroupChildren`.
 */
type AllowedCascadeOptionGroupChildren<TOptions> =
  AllowedOptionGroupChildren<TOptions> | string[]
```
