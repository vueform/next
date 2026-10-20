```ts
/**
 * Part-keyed binding definitions of the VfInputNumber component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfInputNumberBindings
  extends InputNumberBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}
```
