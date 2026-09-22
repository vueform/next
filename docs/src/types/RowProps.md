```ts
/**
 * Props for the row component blueprint that represents a row within a grid.
 */
interface RowProps<
  S = RowSlots,
  P = RowParts,
  C = RowClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The number of grid columns this row spans.
   */
  colspan?: number | string

  /**
   * The number of grid rows this row spans.
   */
  rowspan?: number | string

  /**
   * The horizontal alignment of content within the row.
   */
  align?: AlignProp

  /**
   * The vertical alignment of content within the row.
   */
  valign?: ValignProp
}
```
