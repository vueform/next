```ts
/**
 * Part-keyed binding definitions of the VfRadios component: its own state
 * markers merged with the `choicesAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries resolve at each part's
 * consuming site and their keys stay static; the per-group/per-item entries
 * are parameterized, so their keys are functional.
 */
interface VfRadiosBindings extends RadiosBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The group container's role, labelling, and ARIA state (from the
   * `choicesAria` pattern) merged with its layout markers (stacked row
   * layout, vertical alignment with adjacent form controls) and validation
   * state. A zero-argument resolver: it reads child-aggregating state
   * (`invalid`), which must resolve in the wrapper's own render effect.
   */
  wrapper: {
    'data-stacked'?: ''
    'data-aligned'?: ''
    'data-invalid'?: ''
  } & ChoicesAriaBag

  /**
   * Per-group binding resolver for the group fieldset — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-group part overrides resolve with the group data.
   *
   * @param group The group data.
   */
  group: (group: Record<string, any>) => {}

  /**
   * Per-group binding resolver for the group legend — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-group part overrides resolve with the group data.
   *
   * @param group The group data.
   */
  groupLabel: (group: Record<string, any>) => {}

  /**
   * Per-item binding resolver for each `VfRadio` child — a mode marker: it
   * contributes no attributes of its own, it keys the part functional so
   * per-item part overrides resolve with the item data.
   *
   * @param item The radio item data.
   */
  item: (item: Record<string, any>) => {}
}
```
