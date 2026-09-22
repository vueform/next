```ts
/**
 * Structural parts of the VfRadio component.
 */
interface VfRadioParts extends RadioParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The radio input element.
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

  /**
   * The screen-reader-only text element.
   *
   * @tag label
   */
  srOnlyText: DomAttrsOf<'label'>
}
```
