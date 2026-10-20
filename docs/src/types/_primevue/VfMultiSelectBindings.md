```ts
/**
 * Part-keyed attribute bindings of the VfMultiSelect component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`.
 */
interface VfMultiSelectBindings
  extends MultiSelectBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The multi-select control's validation state, placeholder marker (set
   * while the value is empty and a placeholder is shown), and ARIA state.
   */
  input: {
    'data-invalid'?: ''
    'data-placeholder'?: ''
  } & InputAriaBag
}
```
