```ts
/**
 * CSS classes for the VfLanguages component's structural parts.
 */
interface VfLanguagesClasses extends LanguagesClasses {
  /**
   * The root language selector element.
   */
  root: ClassValue

  /**
   * The language list element.
   */
  list: ClassValue

  /**
   * Each language wrapper.
   *
   * @param selected Whether this language option is currently selected.
   * @param invalid Whether this language has validation errors.
   */
  wrapper: (selected: boolean, invalid: boolean) => ClassValue

  /**
   * The language button element.
   */
  language: ClassValue
}
```
