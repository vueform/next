```ts
/**
 * Slot definitions for multilingual elements.
 */
interface TranslateSlots {
  /**
   * Slot that replaces the language selector rendering.
   *
   * @param props.language The currently active language code.
   * @param props.languages The available languages map.
   */
  language: (props: { language: string; languages: LanguagesProp }) => VNode[]
}
```
