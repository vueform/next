```ts
/**
 * Styling modifiers of the VfToggleButton component.
 */
interface VfToggleButtonModifiers extends ToggleButtonModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The toggle-button control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
