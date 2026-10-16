```ts
/**
 * Structural parts of the VfCheckbox component.
 */
interface VfCheckboxParts extends CheckboxParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The checkbox input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>
}
```
