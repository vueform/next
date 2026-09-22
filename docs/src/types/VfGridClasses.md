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
    align: AlignProp
    valign: ValignProp
    schema?: any
    colHeader?: boolean
    rowHeader?: boolean
  }) => ClassValue
}
```
