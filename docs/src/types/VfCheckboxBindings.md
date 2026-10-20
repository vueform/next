```ts
/**
 * Part-keyed binding definitions of the VfCheckbox component: its own state
 * markers merged with the `inputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfCheckboxBindings extends CheckboxBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The choice wrapper's label alignment variant and the marker set while the
   * element vertically aligns with adjacent form controls.
   */
  wrapper: {
    'data-align'?: VfCheckboxProps['align']
    'data-aligned'?: ''
  }

  /**
   * The checkbox input's validation state and ARIA state.
   */
  input: {
    'data-invalid'?: ''
  } & InputAriaBag
}
```
