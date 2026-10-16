```ts
/**
 * Props for the col component blueprint that represents a column cell within a
 * row.
 */
interface ColProps<
  S = ColSlots,
  P = ColParts,
  C = ColClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The number of grid columns this cell spans.
   */
  colspan?: number | string

  /**
   * The number of grid rows this cell spans.
   */
  rowspan?: number | string

  /**
   * Horizontal alignment of the cell content.
   */
  align?: AlignProp

  /**
   * Vertical alignment of the cell content.
   */
  valign?: ValignProp

  /**
   * Whether this column cell should be styled as a header. Automatically
   * resolves to column header, row header, or both based on position.
   */
  header?: boolean
}
```
