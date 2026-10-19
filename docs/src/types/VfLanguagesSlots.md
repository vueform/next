```ts
/**
 * Slots available in the VfLanguages component.
 */
interface VfLanguagesSlots extends LanguagesSlots<VfLanguagesContext> {
  /**
   * Slot that replaces each individual language option rendering.
   */
  default: (scope: {
    /**
     * The currently selected language code.
     */
    language: string

    /**
     * The resolved available languages (code to label map).
     */
    languages: ResolvedLanguagesProp

    /**
     * This option's language code.
     */
    value: string

    /**
     * This option's display label.
     */
    label: string
  }) => VNode[]
}
```
