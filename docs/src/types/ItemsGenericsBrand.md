```ts
/**
 * Type-only brand carrying `ItemsProps` generics for `makeItems` consumers
 * (`extends ItemsProps<infer …>` re-infers a wide `itemValue` union and
 * collapses values to `any`, hence the brand).
 *
 * `ItemsProps` extends this behind a `@vue-ignore` heritage clause: the SFC
 * compiler skips it when generating runtime props (it cannot resolve symbol
 * members), while the type still flows through `defineProps` into the blueprint
 * props. The symbol key keeps it out of prop completions.
 */
interface ItemsGenericsBrand<
  TItems = ItemsProp,
  TItemValueKey = undefined,
  TGroupChildren = undefined,
  TItemValueReturn = unknown,
> {
  [itemsGenericsBrandKey]?: ItemsGenericsBrandPayload<
    TItems,
    TItemValueKey,
    TGroupChildren,
    TItemValueReturn
  >
}
```
