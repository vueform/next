```ts
/**
 * Props for the grid element blueprint.
 */
interface GridProps<
  T extends string = 'grid',
  S = GridSlots,
  P = GridParts,
  C = GridClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ContainerProps,
    ValidationProps<TContext>,
    ModelProps<ObjectModel, TContext>,
    DisabledProps<TContext> {
  /**
   * The grid schema defining cell contents and layout.
   */
  grid?: GridSchema

  /**
   * Whether the grid nests its data under its own key in the form model.
   */
  nested?: boolean

  /**
   * The number of columns in the grid.
   */
  cols?: number

  /**
   * The number of rows in the grid.
   */
  rows?: number

  /**
   * Horizontal alignment of grid cell content.
   */
  align?: AlignProp

  /**
   * Vertical alignment of grid cell content.
   */
  valign?: ValignProp

  /**
   * Custom widths for each grid column.
   */
  widths?: (null | string | number)[]

  /**
   * Minimum width of the grid before it becomes scrollable.
   */
  minWidth?: string | number

  /**
   * Maximum width of the grid.
   */
  maxWidth?: string | number

  /**
   * Whether the grid is horizontally scrollable when content overflows.
   */
  scrollable?: boolean

  /**
   * Whether to display column headers.
   */
  colHeaders?: boolean

  /**
   * Whether to display row headers.
   */
  rowHeaders?: boolean

  /**
   * Whether the grid uses a tabular visual style with borders and headers.
   */
  tabular?: boolean

  /**
   * Whether column header text can wrap.
   */
  wrapColHeaders?: boolean

  /**
   * Whether row header text can wrap.
   */
  wrapRowHeaders?: boolean
}
```
