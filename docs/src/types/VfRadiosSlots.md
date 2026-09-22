```ts
/**
 * Slots available in the VfRadios component.
 */
interface VfRadiosSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  TValue = ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
  TRaw = RawItemOf<TItems, TGroupChildren>,
> extends RadiosSlots<
  VfRadiosContext<
    VfRadiosProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default radios rendering. Receives resolved items,
   * groups, and shared state.
   */
  default: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedItem<TValue, TRaw>[]
    groups: ResolvedGroup<TValue, TRaw>[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadio` child. Receives the resolved item
   * and shared state.
   */
  item: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedItem<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each individual radio input rendering inside the default
   * `VfRadio` child.
   *
   * Child radios always use the default `true` radio value; the holder's item
   * value is resolved by name, not passed as `radioValue`.
   *
   * @inherits VfRadio.default
   */
  radio: (props: Parameters<VfRadioSlots<true>['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio.
   *
   * @inherits VfRadio.text
   */
  text: (props: Parameters<VfRadioSlots['text']>[0]) => VNode[]
}
```
