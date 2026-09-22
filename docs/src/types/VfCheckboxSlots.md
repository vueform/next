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
  default: (props: {
    model: TTrueValue | TFalseValue
    trueValue: TTrueValue
    falseValue: TFalseValue
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    aria: AriaProp
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the checkbox.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
  }) => VNode[]
}
```
