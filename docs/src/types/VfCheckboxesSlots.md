```ts
/**
 * Slots available in the VfCheckboxes component.
 */
interface VfCheckboxesSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesSlots<
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default checkboxes rendering.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.items Resolved flat checkbox items.
   * @param props.groups Resolved checkbox groups.
   * @param props.grouped Whether items are rendered as groups.
   */
  default: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    groups: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.group The resolved option group.
   */
  group: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    group: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfCheckbox` child.
   *
   * @param props.checkboxName The shared checkbox name attribute.
   * @param props.disabled Whether the checkboxes are disabled.
   * @param props.label The element's resolved label.
   * @param props.item The resolved checkbox item.
   */
  item: (props: {
    checkboxName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >
  }) => VNode[]

  /**
   * Slot that replaces each individual checkbox input rendering.
   *
   * Child checkboxes always use the default `true` / `false` values; the
   * holder's item value is resolved by name, not passed as `trueValue`.
   *
   * @inherits VfCheckbox.default
   */
  checkbox: (
    props: Parameters<VfCheckboxSlots<true, false>['default']>[0]
  ) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (props: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}
```
