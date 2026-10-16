```ts
/**
 * Slot definitions for multilingual elements.
 */
interface TranslateSlots {
  /**
   * Slot that replaces the language selector rendering.
   *
   * @param scope The language slot's params.
   */
  language: (scope: {
    /**
     * The currently active language code.
     */
    language: string

    /**
     * The available languages map.
     */
    languages: LanguagesProp
  }) => VNode[]
}
```
