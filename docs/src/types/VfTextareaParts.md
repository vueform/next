```ts
/**
 * Structural parts of the VfTextarea component.
 */
interface VfTextareaParts
  extends TextareaParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>

  /**
   * The textarea element.
   *
   * @tag textarea
   */
  input: DomAttrsOf<'textarea'>
}
```
