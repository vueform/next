```ts
/**
 * Slots available in the VfCheckbox component.
 */
interface VfCheckboxSlots<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxSlots<
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {
  /**
   * Slot that replaces the default checkbox rendering. Receives input-specific
   * props.
   */
  default: (scope: {
    /**
     * The current model value.
     */
    model: TTrueValue | TFalseValue

    /**
     * The value used when the checkbox is checked.
     */
    trueValue: TTrueValue

    /**
     * The value used when the checkbox is unchecked.
     */
    falseValue: TFalseValue

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the checkbox is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    inputRef: any

    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The default slot's own part is the wrapper (the fallback's top-level
     * element): its resolved part overrides and alignment modifiers; apply
     * with `v-bind`.
     */
    bindings: VfCheckboxResolvedBindings['wrapper']

    /**
     * Handler for the input's blur event.
     *
     * @param e The native blur event.
     */
    handleBlur: (e: FocusEvent) => void

    /**
     * Handler for the input's focus event.
     *
     * @param e The native focus event.
     */
    handleFocus: (e: FocusEvent) => void

    /**
     * Handler that updates the model from an input event.
     *
     * @param e The native input event.
     */
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (scope: {
    /**
     * The checkbox label text.
     */
    text: string | undefined

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * The element's generic name, used as screen-reader-only fallback text.
     */
    genericName: string

    /**
     * The text element's resolved bindings (part overrides); apply with
     * `v-bind`.
     */
    bindings: VfCheckboxResolvedBindings['text']
  }) => VNode[]
}
```
