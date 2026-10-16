```ts
/**
 * The model value type for an options-based element. PrimeVue-named counterpart
 * of core `ItemsModel`.
 */
type OptionsModel<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> = ItemsModel<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn
>
```
