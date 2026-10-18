```ts
/**
 * Styling modifiers of the VfEditor component.
 */
interface VfEditorModifiers extends EditorModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The editor control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
