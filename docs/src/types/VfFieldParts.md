```ts
/**
 * Structural parts of the VfField component.
 */
interface VfFieldParts
  extends FieldParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The user-rendered control. VfField does not render it — the default slot
   * supplies the markup and applies `bindings.input` (ARIA state and part
   * overrides) to whichever element acts as the control.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>
}
```
