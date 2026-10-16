```ts
/**
 * Type-parameter payload stored under `itemsGenericsBrandKey`.
 */
type ItemsGenericsBrandPayload<
  TItems = ItemsProp,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> = {
  items: TItems
  itemValueKey: TItemValueKey
  groupChildren: TGroupChildren
  itemValueReturn: TItemValueReturn
}
```
