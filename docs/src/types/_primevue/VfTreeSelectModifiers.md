```ts
/**
 * Styling modifiers of the VfTreeSelect component.
 */
interface VfTreeSelectModifiers extends TreeSelectModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The tree-select control's validation state and placeholder marker, set
   * while the value is empty and a placeholder is shown.
   */
  input: {
    'data-invalid'?: ''
    'data-placeholder'?: ''
  }
}
```
