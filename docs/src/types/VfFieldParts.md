```ts
/**
 * Structural parts of the VfField component.
 */
interface VfFieldParts
  extends FieldParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>
}
```
