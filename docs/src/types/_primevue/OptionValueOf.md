```ts
/**
 * The selected value type derived from `options` and an optional `optionValue`
 * key / mapper return. PrimeVue-named counterpart of core `ItemValueOf`.
 */
type OptionValueOf<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TOptionValueReturn = unknown,
> = ItemValueOf<TOptions, TOptionValueKey, TGroupChildren, TOptionValueReturn>
```
