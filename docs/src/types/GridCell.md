```ts
/**
 * A fully positioned grid cell with row/col coordinates and optional CSS
 * grid-area style.
 */
type GridCell = ResolvedCell & {
  /**
   * The cell's row index in the resolved grid.
   */
  row: number

  /**
   * The cell's column index in the resolved grid.
   */
  col: number

  /**
   * The CSS grid row start position (0-based).
   */
  rowStart: number

  /**
   * The CSS grid column start position (0-based).
   */
  colStart: number

  /**
   * The CSS grid row end position (0-based).
   */
  rowEnd: number

  /**
   * The CSS grid column end position (0-based).
   */
  colEnd: number

  /**
   * Whether this cell is a column header (first row when colHeaders is
   * enabled).
   */
  colHeader: boolean

  /**
   * Whether this cell is a row header (first column when rowHeaders is
   * enabled).
   */
  rowHeader: boolean

  /**
   * Whether this cell occupies the last row of the grid.
   */
  lastRow: true | undefined

  /**
   * Whether this cell occupies the last column of the grid.
   */
  lastCol: true | undefined
}
```
