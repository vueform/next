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
  default: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * Resolved flat radio items.
     */
    items: ResolvedItem<TValue, TRaw>[]

    /**
     * Resolved radio groups.
     */
    groups: ResolvedGroup<TValue, TRaw>[]

    /**
     * Whether items are rendered as groups.
     */
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved option group.
     */
    group: ResolvedGroup<TValue, TRaw>

    /**
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfRadiosResolvedBindings['group']
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadio` child. Receives the resolved item
   * and shared state.
   */
  item: (scope: {
    /**
     * The shared radio name attribute.
     */
    radioName: string

    /**
     * Whether the radios are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved radio item.
     */
    item: ResolvedItem<TValue, TRaw>

    /**
     * The item's resolved bindings (part overrides for this item's VfRadio
     * child); apply with `v-bind`.
     */
    bindings: VfRadiosResolvedBindings['item']
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
  radio: (scope: Parameters<VfRadioSlots<true>['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio.
   *
   * @inherits VfRadio.text
   */
  text: (scope: Parameters<VfRadioSlots['text']>[0]) => VNode[]
}
```
