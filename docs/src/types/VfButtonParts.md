```ts
/**
 * Structural parts of the VfButton component.
 */
interface VfButtonParts extends ButtonParts {
  /**
   * The root button or anchor element.
   *
   * @tag button | a
   */
  button: DomAttrsOf<'button' | 'a'>

  /**
   * The icon of the button.
   *
   * @tag i
   */
  icon: DomAttrsOf<'i'>

  /**
   * The text of the button.
   *
   * @tag span
   */
  text: DomAttrsOf<'span'>
}
```
