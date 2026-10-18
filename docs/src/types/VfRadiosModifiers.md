```ts
/**
 * Styling modifiers of the VfRadios component.
 */
interface VfRadiosModifiers extends RadiosModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The group container's layout markers (stacked row layout, vertical
   * alignment with adjacent form controls) and validation state.
   */
  group: {
    'data-stacked'?: ''
    'data-aligned'?: ''
    'data-invalid'?: ''
  }
}
```
