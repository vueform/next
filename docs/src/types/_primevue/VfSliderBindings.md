```ts
/**
 * Part-keyed attribute bindings of the VfSlider component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`.
 */
interface VfSliderBindings extends SliderBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The slider control's validation and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}
```
