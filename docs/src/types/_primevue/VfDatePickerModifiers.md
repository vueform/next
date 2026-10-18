```ts
/**
 * Styling modifiers of the VfDatePicker component.
 */
interface VfDatePickerModifiers extends DatePickerModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
