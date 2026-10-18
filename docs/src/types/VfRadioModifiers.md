```ts
/**
 * Styling modifiers of the VfRadio component.
 */
interface VfRadioModifiers extends RadioModifiers {
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
    'data-align'?: VfRadioProps['align']
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
