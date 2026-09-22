```ts
/**
 * Structural parts of the VfLanguages component.
 */
interface VfLanguagesParts extends LanguagesParts {
  /**
   * The root language selector element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * The language list element.
   *
   * @tag ul
   */
  list: DomAttrsOf<'ul'>

  /**
   * Each language wrapper. Receives whether this option is currently selected
   * and whether this language has validation errors.
   *
   * @param selected Whether this language option is currently selected.
   * @param invalid Whether this language has validation errors.
   * @tag li
   */
  wrapper: (selected: boolean, invalid: boolean) => DomAttrsOf<'li'>

  /**
   * The language button element.
   *
   * @tag button
   */
  language: DomAttrsOf<'button'>
}
```
