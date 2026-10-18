```ts
/**
 * Styling modifiers of the VfCheckbox component.
 */
interface VfCheckboxModifiers extends CheckboxModifiers {
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
    'data-align'?: VfCheckboxProps['align']
    'data-aligned'?: ''
  }

  /**
   * The checkbox input's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
