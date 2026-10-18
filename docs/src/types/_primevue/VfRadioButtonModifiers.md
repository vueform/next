```ts
/**
 * Styling modifiers of the VfRadioButton component.
 */
interface VfRadioButtonModifiers extends RadioButtonModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The choice wrapper's label alignment variant and the marker set while the
   * element vertically aligns with adjacent form controls.
   */
  wrapper: {
    'data-align'?: VfRadioButtonProps['align']
    'data-aligned'?: ''
  }

  /**
   * The radio input's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
