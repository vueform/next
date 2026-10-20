```ts
/**
 * Styling modifiers of the VfRadioButtonGroup component.
 */
interface VfRadioButtonGroupModifiers extends RadioButtonGroupModifiers {
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
  wrapper: () => {
    'data-stacked'?: ''
    'data-aligned'?: ''
    'data-invalid'?: ''
  }
}
```
