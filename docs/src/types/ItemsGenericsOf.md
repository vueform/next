```ts
/**
 * Props generics carried by an items-based element, recovered from the
 * `ItemsGenericsBrand` heritage on `ItemsProps`. (`extends ItemsProps<infer…>`
 * re-infers a wide `itemValue` union and collapses values to `any`.)
 *
 * Matches against the named `ItemsGenericsBrand` interface — not an inline
 * `[itemsGenericsBrandKey]` object — so declaration emit can name the type in
 * deferred conditionals (computed symbol keys cannot be named across modules,
 * TS4023/TS4058).
 */
type ItemsGenericsOf<P> =
  P extends ItemsGenericsBrand<
    infer TItems,
    infer TItemValueKey,
    infer TGroupChildren,
    infer TItemValueReturn
  >
    ? {
        items: TItems
        itemValueKey: TItemValueKey
        groupChildren: TGroupChildren
        itemValueReturn: TItemValueReturn
      }
    : {
        items: ItemsProp
        itemValueKey: undefined
        groupChildren: undefined
        itemValueReturn: unknown
      }
```
