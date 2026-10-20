```ts
/**
 * Part-keyed binding definitions of the VfSelect component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfSelectBindings extends SelectBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The select control's validation state, placeholder marker (set while the
   * value is empty and a placeholder is shown), and ARIA state.
   */
  input: {
    'data-invalid'?: ''
    'data-placeholder'?: ''
  } & InputAriaBag
}
```
