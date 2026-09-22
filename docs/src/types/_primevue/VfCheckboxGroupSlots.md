```ts
/**
 * Slots available in the VfCheckboxGroup component.
 */
interface VfCheckboxGroupSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
> extends CheckboxGroupSlots<
  VfCheckboxGroupContext<
    VfCheckboxGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
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
    items: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
    >[]
    groups: ResolvedGroup<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
    item: ResolvedOption<
      OptionValueOf<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        TOptionValueReturn
      >,
      RawOptionOf<TOptions, TGroupChildren>
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
  checkbox: (props: Parameters<VfCheckboxSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (props: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}
```
