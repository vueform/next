```ts
/**
 * Context for a grid row, extending the grid context with the row index and
 * column sizes.
 */
type RowContext = GridContext & {
  /**
   * The zero-based index of this row within the grid.
   */
  row: ComputedRef<number>

  /**
   * The resolved column sizes for each cell in this row.
   */
  cols: ComputedRef<number[]>
}
```
