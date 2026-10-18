```ts
/**
 * Styling modifiers of the VfSlider component.
 */
interface VfSliderModifiers extends SliderModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The slider control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
