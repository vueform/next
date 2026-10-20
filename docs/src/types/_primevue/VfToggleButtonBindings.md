```ts
/**
 * Part-keyed attribute bindings of the VfToggleButton component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`.
 */
interface VfToggleButtonBindings
  extends ToggleButtonBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The toggle-button control's validation and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}
```
