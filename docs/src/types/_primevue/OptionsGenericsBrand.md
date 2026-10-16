```ts
/**
 * Type-only brand carrying `OptionsProps` generics for `makeItems` consumers.
 * PrimeVue-named counterpart of core `ItemsGenericsBrand`.
 */
type OptionsGenericsBrand<
  TOptions = OptionsProp,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TOptionValueReturn = unknown,
> = ItemsGenericsBrand<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TOptionValueReturn
>
```
