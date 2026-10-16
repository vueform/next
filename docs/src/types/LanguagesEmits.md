```ts
/**
 * Events emitted by the languages component.
 */
interface LanguagesEmits<TContext = any> extends BaseComponentEmits<TContext> {
  /**
   * Emitted when a language is selected by the user.
   *
   * @param language The selected language code.
   */
  select: [language: string]
}
```
