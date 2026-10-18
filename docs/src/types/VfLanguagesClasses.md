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
   * Each language wrapper. State is exposed via `data-selected` and
   * `data-invalid` attributes.
   */
  wrapper: ClassValue

  /**
   * The language button element.
   */
  language: ClassValue
}
```
