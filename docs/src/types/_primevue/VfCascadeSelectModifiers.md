```ts
/**
 * Styling modifiers of the VfCascadeSelect component.
 */
interface VfCascadeSelectModifiers extends CascadeSelectModifiers {
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
