```ts
/**
 * Styling modifiers of the VfSelectButton component.
 */
interface VfSelectButtonModifiers extends SelectButtonModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The select-button control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
