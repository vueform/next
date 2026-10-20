```ts
/**
 * Part-keyed binding definitions of the VfTextarea component: its own state
 * markers merged with the `tInputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfTextareaBindings extends TextareaBindings, LayoutRegionBindings {
  /**
   * The textarea control's validation and sizing behavior markers plus its
   * ARIA state, including the active editing language for translatable
   * inputs.
   */
  input: {
    'data-invalid'?: ''
    'data-resizable'?: ''
    'data-autogrow'?: ''
  } & TInputAriaBag
}
```
