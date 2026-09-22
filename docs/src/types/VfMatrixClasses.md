```ts
/**
 * CSS classes for the VfMatrix component's structural parts.
 */
interface VfMatrixClasses extends MatrixClasses {
  /**
   * The grid layout element.
   */
  grid: ClassValue

  /**
   * The header row element.
   */
  header: ClassValue

  /**
   * Each column header element.
   */
  colHeader: ClassValue

  /**
   * Each row element. Receives drag state.
   *
   * @param beingDragged Whether this row is currently being dragged.
   * @param isDropTarget Whether this row is the current drop target.
   */
  row: (beingDragged: boolean, isDropTarget: boolean) => ClassValue

  /**
   * Each row header element.
   */
  rowHeader: ClassValue

  /**
   * Each cell element.
   */
  cell: ClassValue

  /**
   * The drag sort handle wrapper element.
   */
  sortWrapper: ClassValue

  /**
   * The drag sort handle element.
   */
  sort: ClassValue

  /**
   * The row remove button wrapper element.
   */
  removeWrapper: ClassValue

  /**
   * The row remove button element.
   */
  remove: ClassValue

  /**
   * The add row button element.
   */
  add: ClassValue
}
```
