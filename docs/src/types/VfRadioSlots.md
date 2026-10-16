```ts
/**
 * Slots available in the VfRadio component.
 */
interface VfRadioSlots<TRadioValue = any> extends RadioSlots<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (scope: {
    /**
     * The value used when the radio is selected.
     */
    value: TRadioValue

    /**
     * The current model value.
     */
    model: TRadioValue | null

    /**
     * ARIA attributes for the input.
     */
    aria: AriaProp

    /**
     * The input's `name` attribute.
     */
    inputName: string

    /**
     * The input's `id` attribute.
     */
    id: string

    /**
     * Whether the radio is disabled.
     */
    disabled: boolean

    /**
     * The input DOM element reference.
     */
    input: any

    /**
     * The radio label text.
     */
    text: string | undefined

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
   * Slot that replaces the text/label portion of the radio.
   */
  text: (scope: {
    /**
     * The radio label text.
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
  }) => VNode[]
}
```
