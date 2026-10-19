```ts
/**
 * Structural parts of the VfGrid component.
 */
interface VfGridParts extends GridParts {
  /**
   * The scrollable wrapper around the grid layout element.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The grid layout element.
   *
   * @tag div
   */
  grid: DomAttrsOf<'div'>

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   * @tag div
   */
  cell: (options: {
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => DomAttrsOf<'div'>
}
```
