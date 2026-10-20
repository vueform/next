```ts
/**
 * Part-keyed binding definitions of the VfFileUpload component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfFileUploadBindings
  extends FileUploadBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The file-upload control's validation state and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}
```
