```ts
/**
 * Part-keyed binding definitions of the VfContent component, registered via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfContentBindings extends ContentBindings {
  /**
   * The root element's label-alignment marker, horizontal text alignment, and
   * the marker set while the content vertically aligns with adjacent form
   * controls.
   */
  root: {
    'data-align-label'?: ''
    'data-align'?: AlignProp
    'data-aligned'?: ''
  }
}
```
