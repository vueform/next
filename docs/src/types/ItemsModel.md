```ts
/**
 * The model value type for an items-based element. When `items` is an endpoint
 * URL string, `TModel` is used so `v-model` can drive inference; otherwise the
 * value is derived from `items` / `itemValue` / `multiple`.
 */
type ItemsModel<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> =
  IsDefaultItems<TItems> extends true
    ? TModel
    : UnwrappedItems<TItems> extends string
      ? TModel
      : TMultiple extends true
        ? ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>[]
        : ItemValueOf<
            TItems,
            TItemValueKey,
            TGroupChildren,
            TItemValueReturn
          > | null
```
