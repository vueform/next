```ts
/**
 * Styling modifiers of the VfToggleSwitch component.
 */
interface VfToggleSwitchModifiers extends ToggleSwitchModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The toggle-switch control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
