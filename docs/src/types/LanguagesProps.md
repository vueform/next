```ts
/**
 * Props for the languages component blueprint that renders a language selector
 * for multilingual forms.
 */
interface LanguagesProps<
  S = LanguagesSlots,
  P = LanguagesParts,
  C = LanguagesClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The currently active language code.
   */
  language: string

  /**
   * The available languages as a map of language codes to display names.
   */
  languages: ResolvedLanguagesProp

  /**
   * Set of language codes that currently have validation errors.
   */
  invalidLanguages?: Set<string>
}
```
