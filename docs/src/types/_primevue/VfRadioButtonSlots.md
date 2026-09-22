```ts
/**
 * Slots available in the VfRadioButton component.
 */
interface VfRadioButtonSlots<TRadioValue = any> extends RadioButtonSlots<
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (props: {
    value: TRadioValue
    model: TRadioValue | null
    aria: AriaProp
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleInput: (payload: any, e?: Event) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   *
   * @param props.text The resolved label text.
   * @param props.id The element's unique ID.
   * @param props.genericName The element's display name for accessibility.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
  }) => VNode[]
}
```
