```ts
/**
 * Styling modifiers of the VfFile component.
 */
interface VfFileModifiers extends FileModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The file input control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
