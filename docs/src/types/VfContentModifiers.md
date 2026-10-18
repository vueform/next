```ts
/**
 * Styling modifiers of the VfContent component.
 */
interface VfContentModifiers extends ContentModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text, its horizontal text alignment, and the marker set while
   * the content vertically aligns with adjacent form controls.
   */
  root: {
    'data-align-label'?: ''
    'data-align'?: AlignProp
    'data-aligned'?: ''
  }
}
```
