```ts
/**
 * Props for elements that support multilingual/translatable values,
 * parameterized by the model-driving type arguments (`translate` /
 * `languages`). Plain usage (`TranslateProps`) keeps every member wide.
 */
interface TranslateProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> {
  /**
   * Whether the element's value is translatable into multiple languages.
   */
  translate?: TTranslate | boolean

  /**
   * The default selected language.
   */
  language?: string

  /**
   * The available languages for translatable content.
   */
  languages?: TLanguages
}
```
