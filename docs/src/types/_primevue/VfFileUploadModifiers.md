```ts
/**
 * Styling modifiers of the VfFileUpload component.
 */
interface VfFileUploadModifiers extends FileUploadModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The file-upload control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
