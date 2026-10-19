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
   * Each row element. Drag state is exposed via `data-dragging` and
   * `data-drop-target` attributes.
   */
  row: ClassValue

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
   *
   * @param index The row's zero-based index.
   */
  sort: (index: number) => ClassValue

  /**
   * The row remove button wrapper element.
   */
  removeWrapper: ClassValue

  /**
   * The row remove button element.
   *
   * @param index The row's zero-based index.
   */
  remove: (index: number) => ClassValue

  /**
   * The add row button element.
   */
  add: ClassValue
}
```
