```ts
/**
 * Styling modifiers of the VfMatrix component.
 */
interface VfMatrixModifiers extends MatrixModifiers {
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
}
```
