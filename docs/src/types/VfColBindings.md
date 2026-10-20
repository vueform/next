```ts
/**
 * Part-keyed binding definitions of the VfCol component, registered via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfColBindings extends ColBindings {
  /**
   * The root column element's horizontal and vertical alignment attributes.
   */
  root: {
    'data-align'?: AlignProp
    'data-valign'?: ValignProp
  }
}
```
