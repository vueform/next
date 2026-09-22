```ts
/**
 * Slots available in the VfLanguages component.
 */
interface VfLanguagesSlots extends LanguagesSlots<VfLanguagesContext> {
  /**
   * Slot that replaces each individual language option rendering.
   */
  default: (props: {
    parts: Partial<VfLanguagesParts>
    classes: VfLanguagesClasses
    language: string
    languages: ResolvedLanguagesProp
    value: string
    label: string
  }) => VNode[]
}
```
