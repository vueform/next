```ts
/**
 * Model / default prop type for items-based elements.
 *
 * Always includes `NoInfer<ItemsModel<…>>` so `modelValue` / `default` /
 * `v-model` do not compete with `itemValue` (and `items`) when inferring
 * generics. An outer conditional around `NoInfer` (e.g. `IsDefaultItems ?
 * TModel : NoInfer<…>`) is resolved against unbound Vue type parameters and
 * never re-evaluated after inference — which collapsed the prop to `any`.
 *
 * Endpoint URL `items` also union in a naked `TModel` arm so `v-model` can
 * still drive `TModel` when the items shape is a string.
 */
type ItemsModelProp<
  TItems,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
> =
  | NoInfer<
      ItemsModel<
        TItems,
        TItemValueKey,
        TGroupChildren,
        TMultiple,
        TModel,
        TItemValueReturn
      >
    >
  | ([UnwrappedItems<TItems>] extends [string] ? TModel : never)
```
