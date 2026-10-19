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
  default: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
     */
    label: string | undefined

    /**
     * The resolved option items.
     */
    items: ResolvedOption<TValue, TRaw>[]

    /**
     * The resolved option groups.
     */
    groups: ResolvedGroup<TValue, TRaw>[]

    /**
     * Whether the options are grouped.
     */
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   */
  group: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
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
    bindings: VfRadioButtonGroupBindings['group']
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfRadioButton` child. Receives the resolved
   * item and shared state.
   */
  item: (scope: {
    /**
     * The shared `name` attribute of the radio inputs.
     */
    radioName: string

    /**
     * Whether the group is disabled.
     */
    disabled: boolean

    /**
     * The resolved label text.
     */
    label: string | undefined

    /**
     * The resolved option item.
     */
    item: ResolvedOption<TValue, TRaw>

    /**
     * The item's resolved bindings (part overrides for this item's
     * VfRadioButton child); apply with `v-bind`.
     */
    bindings: VfRadioButtonGroupBindings['item']
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
  radio: (scope: Parameters<VfRadioButtonSlots['default']>[0]) => VNode[]

  /**
   * Slot that replaces the text/label of each individual radio button.
   *
   * @inherits VfRadioButton.text
   */
  text: (scope: Parameters<VfRadioButtonSlots['text']>[0]) => VNode[]
}
```
