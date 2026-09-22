```ts
/**
 * Structural parts of the VfText component.
 */
interface VfTextParts
  extends TextParts, AddonsParts, AddonGroupParts, IconsParts, TranslateParts {
  /**
   * The text input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>
}
```
