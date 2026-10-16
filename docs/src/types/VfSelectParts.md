```ts
/**
 * Structural parts of the VfSelect component.
 */
interface VfSelectParts extends SelectParts, AddonsParts, IconsParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>

  /**
   * The select input element.
   *
   * @tag select
   */
  input: DomAttrsOf<'select'>
}
```
