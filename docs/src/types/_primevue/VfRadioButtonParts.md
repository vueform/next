```ts
/**
 * Structural parts of the VfRadioButton component.
 */
interface VfRadioButtonParts extends RadioButtonParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The PrimeVue RadioButton input element.
   *
   * @tag RadioButton
   */
  input: PvRadioButtonProps

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>
}
```
