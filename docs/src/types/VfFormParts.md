```ts
/**
 * Structural parts of the VfForm component.
 */
interface VfFormParts extends FormParts {
  /**
   * The root form element.
   *
   * @tag div
   */
  root: DomAttrsOf<'div'>

  /**
   * Props forwarded to the nested VfLanguages component.
   *
   * @tag VfLanguages
   */
  languages: PartOf<'VfLanguages'>

  /**
   * Props forwarded to the nested VfTabs component.
   *
   * @tag VfTabs
   */
  tabs: PartOf<'VfTabs'>

  /**
   * Props forwarded to the nested VfSteps component.
   *
   * @tag VfSteps
   */
  steps: PartOf<'VfSteps'>

  /**
   * Props forwarded to the nested VfElements component.
   *
   * @tag VfElements
   */
  elements: PartOf<'VfElements'>

  /**
   * The errors container element.
   *
   * @tag div
   */
  errorsWrapper: DomAttrsOf<'div'>

  /**
   * The error list element.
   *
   * @tag ul
   */
  errors: DomAttrsOf<'ul'>

  /**
   * Each error item element.
   *
   * @tag li
   */
  error: DomAttrsOf<'li'>

  /**
   * The messages container element.
   *
   * @tag div
   */
  messagesWrapper: DomAttrsOf<'div'>

  /**
   * The message list element.
   *
   * @tag ul
   */
  messages: DomAttrsOf<'ul'>

  /**
   * Each message item element.
   *
   * @tag li
   */
  message: DomAttrsOf<'li'>

  /**
   * Props forwarded to the nested VfNav component.
   *
   * @tag VfNav
   */
  nav: PartOf<'VfNav'>
}
```
