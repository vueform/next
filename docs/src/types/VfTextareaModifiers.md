```ts
/**
 * Styling modifiers of the VfTextarea component.
 */
interface VfTextareaModifiers extends TextareaModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The textarea control's validation state and sizing behavior markers.
   */
  input: {
    'data-invalid'?: ''
    'data-resizable'?: ''
    'data-autogrow'?: ''
  }
}
```
