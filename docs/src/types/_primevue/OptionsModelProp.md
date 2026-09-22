```ts
/**
 * Model / default prop type for options-based elements. PrimeVue-named
 * counterpart of core `ItemsModelProp`.
 */
type OptionsModelProp<
  TOptions,
  TOptionValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
> = ItemsModelProp<
  TOptions,
  TOptionValueKey,
  TGroupChildren,
  TMultiple,
  TModel,
  TOptionValueReturn
>
```
