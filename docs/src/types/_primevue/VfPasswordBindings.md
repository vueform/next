```ts
/**
 * Part-keyed binding definitions of the VfPassword component: its own state
 * markers merged with the `tInputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfPasswordBindings extends PasswordBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation and ARIA state, including the active
   * editing language for translatable inputs.
   */
  input: {
    'data-invalid'?: ''
  } & TInputAriaBag
}
```
