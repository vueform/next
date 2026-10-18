```ts
/**
 * Styling modifiers of the VfInputMask component.
 */
interface VfInputMaskModifiers extends InputMaskModifiers {
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
