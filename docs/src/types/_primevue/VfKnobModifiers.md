```ts
/**
 * Styling modifiers of the VfKnob component.
 */
interface VfKnobModifiers extends KnobModifiers {
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
