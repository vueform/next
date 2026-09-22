```ts
/**
 * Slots available in the VfRadioButtonGroup component.
 */
interface VfRadioButtonGroupSlots<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  TValue = OptionValueOf<
    TOptions,
    TOptionValueKey,
    TGroupChildren,
    TOptionValueReturn
  >,
  TRaw = RawOptionOf<TOptions, TGroupChildren>,
> extends RadioButtonGroupSlots<
  VfRadioButtonGroupContext<
    VfRadioButtonGroupProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TModel,
      TOptionValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default radio buttons rendering. Receives resolved
   * items, groups, and shared state.
   */
  default: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    items: ResolvedOption<TValue, TRaw>[]
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
   * Slot that replaces each entire `VfRadioButton` child. Receives the resolved
   * item and shared state.
   */
  item: (props: {
    radioName: string
    disabled: boolean
    label: string | undefined
    item: ResolvedOption<TValue, TRaw>
  }) => VNode[]

  /**
   * Slot that replaces each individual radio button input rendering inside the
   * default `VfRadioButton` child.
   *
   * Child radios always use the default `true` radio value; the holder's item
   * value is resolved by name, not passed as `value`.
   *
   * @inherits VfRadioButton.default
   */
  radio: (props: Parameters<VfRadioButtonSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio button.
   *
   * @inherits VfRadioButton.text
   */
  text: (props: Parameters<VfRadioButtonSlots['text']>[0]) => VNode[]
}
```
