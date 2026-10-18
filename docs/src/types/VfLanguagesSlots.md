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

    /**
     * The component's resolved CSS classes.
     */
    classes: VfLanguagesClasses

    /**
     * The component's structural part bindings.
     */
    parts: Partial<VfLanguagesParts>

    /**
     * The component's styling modifiers, keyed by part name; apply each bag
     * with `v-bind` (the `wrapper` bag is a function of the option state).
     */
    modifiers: VfLanguagesModifiers
  }) => VNode[]
}
```
