```ts
/**
 * CSS classes for the VfGrid component's structural parts.
 */
interface VfGridClasses extends GridClasses {
  /**
   * The grid wrapper element.
   */
  wrapper: ClassValue

  /**
   * The grid layout element.
   */
  grid: ClassValue

  /**
   * Each cell element. Receives alignment, schema, and header options.
   *
   * @param options Alignment, optional schema, and header flags for this cell.
   */
  cell: (options: {
    /**
     * The cell's horizontal alignment.
     */
    align: AlignProp

    /**
     * The cell's vertical alignment.
     */
    valign: ValignProp

    /**
     * The element schema rendered in the cell, if any.
     */
    schema?: any

    /**
     * Whether the cell is a column header.
     */
    colHeader?: boolean

    /**
     * Whether the cell is a row header.
     */
    rowHeader?: boolean
  }) => ClassValue
}
```
