```ts
/**
 * Part definitions for elements that support before/after icons.
 */
interface IconsParts {
  /**
   * The icon rendered before the input.
   *
   * @tag VfIcon
   */
  iconBefore: PartOf<'VfIcon'>

  /**
   * The icon rendered after the input.
   *
   * @tag VfIcon
   */
  iconAfter: PartOf<'VfIcon'>

  /**
   * The wrapper element grouping icons and the input.
   *
   * @tag div
   */
  iconGroup: DomAttrsOf<'div'>
}
```
