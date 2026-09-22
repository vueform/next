```ts
/**
 * Slots available in the VfSelect component.
 */
interface VfSelectSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TItemValueReturn = unknown,
  TValue = ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
  TRaw = RawItemOf<TItems, TGroupChildren>,
>
  extends
    SelectSlots<
      VfSelectContext<
        VfSelectProps<
          TItems,
          TItemValueKey,
          TGroupChildren,
          TMultiple,
          TModel,
          TItemValueReturn
        >
      >
    >,
    AddonsSlots,
    IconsSlots {
  /**
   * Slot that replaces the label of each native option.
   *
   * @param props.item The resolved option item.
   */
  option: (props: { item: ResolvedItem<TValue, TRaw> }) => VNode[]
}
```
