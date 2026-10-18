```ts
/**
 * Styling modifiers of the VfMultiSelect component.
 */
interface VfMultiSelectModifiers extends MultiSelectModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The multi-select control's validation state and placeholder marker, set
   * while the value is empty and a placeholder is shown.
   */
  input: {
    'data-invalid'?: ''
    'data-placeholder'?: ''
  }
}
```
