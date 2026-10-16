```ts
/**
 * Structural parts of the VfNav component.
 */
interface VfNavParts extends NavParts {
  /**
   * The root navigation element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The back button element.
   *
   * @tag VfButton
   */
  back: PartOf<'VfButton'>

  /**
   * The next button element.
   *
   * @tag VfButton
   */
  next: PartOf<'VfButton'>

  /**
   * The finish button element.
   *
   * @tag VfButton
   */
  finish: PartOf<'VfButton'>

  /**
   * The screen-reader-only loading indicator element.
   *
   * @tag span
   */
  srOnlyLoading: DomAttrsOf<'span'>
}
```
