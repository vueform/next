```ts
/**
 * Prop-dependent return type of `makeItems`. `items` / `groups` element types
 * follow the generics carried by `P` (typically via `ItemsProps`).
 */
type MakeItemsReturn<P = MakeItemsOptions['props']> = {
  items: Ref<ResolvedItem<ItemValueFromProps<P>, RawItemFromProps<P>>[]>
  groups: Ref<ResolvedGroup<ItemValueFromProps<P>, RawItemFromProps<P>>[]>
  rawItems: ComputedRef<any[]>
  resolvedItems: ShallowRef<any[] | Record<string, any>>
  normalizedItems: ComputedRef<NormalizedItem[]>
  selectedLabel: ComputedRef<string | string[] | undefined>
  itemLabel: ComputedRef<string | ((item: any) => string)>
  itemValue: ComputedRef<string | ((item: any) => any) | undefined>
  itemDisabled: ComputedRef<string | ((item: any) => boolean) | undefined>
  grouped: ComputedRef<boolean>
  resolving: ShallowRef<boolean>
  synthetic: ComputedRef<boolean>
  resolveItems: () => void
}
```
