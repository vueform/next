```ts
/**
 * Context for a grid layout containing inline grid state, cells, and a refresh
 * callback.
 */
type GridContext = {
  /**
   * The reactive inline grid state holding column and row definitions.
   */
  inlineGrid: Ref<InlineGrid>

  /**
   * The computed list of resolved grid cells.
   */
  cells: Ref<GridCell[]>

  /**
   * Whether the first row of the grid uses header styling.
   */
  colHeaders: Ref<boolean>

  /**
   * Whether the first column of the grid uses header styling.
   */
  rowHeaders: Ref<boolean>

  /**
   * The grid-level horizontal alignment for cell content.
   */
  align: Ref<AlignProp>

  /**
   * The grid-level vertical alignment for cell content.
   */
  valign: Ref<ValignProp>

  /**
   * Recalculates the inline grid layout.
   */
  refreshInlineGrid: () => void
}
```
