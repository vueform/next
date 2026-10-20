```ts
/**
 * Part-keyed binding definitions of the VfMatrix component. The grid /
 * header-related / add entries are zero-argument resolvers — resolved at each
 * part's consuming site, keys stay static — while the per-row `row` and
 * per-index `sort` / `remove` entries are parameterized, so those keys are
 * functional.
 */
interface VfMatrixBindings extends MatrixBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The matrix grid's scroll-mode marker, set while `scrollable` is enabled.
   */
  grid: {
    'data-scrollable'?: ''
  }

  /**
   * Each column header's sticky marker, set while `stickyCols` is enabled.
   */
  colHeader: {
    'data-sticky'?: ''
  }

  /**
   * Each row header's sticky marker, set while `stickyRows` is enabled.
   */
  rowHeader: {
    'data-sticky'?: ''
  }

  /**
   * Each row element's drag state.
   *
   * @param beingDragged Whether this row is currently being dragged.
   * @param isDropTarget Whether this row is the current drop target.
   */
  row: (
    beingDragged: boolean,
    isDropTarget: boolean
  ) => {
    'data-dragging'?: ''
    'data-drop-target'?: ''
  }

  /**
   * The add-row control's localized accessible name (when it renders without
   * a visible label).
   */
  add: {
    'aria-label'?: string
  }

  /**
   * The per-row sort handle's localized accessible name.
   *
   * @param index The row's zero-based index.
   */
  sort: (index: number) => {
    'aria-label': string
  }

  /**
   * The per-row remove control's localized accessible name (when it renders
   * without a visible label).
   *
   * @param index The row's zero-based index.
   */
  remove: (index: number) => {
    'aria-label'?: string
  }
}
```
