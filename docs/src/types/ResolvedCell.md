```ts
/**
 * A resolved grid cell: what it mounts (`key` / `component` / `props`), its
 * span, and its alignment.
 */
type ResolvedCell = {
  /**
   * Stable key for the rendered cell: the element's `name` for schema cells,
   * the `row-col` position otherwise.
   */
  key: string

  /**
   * What the cell mounts: the resolved element component for schema cells (an
   * explicit `component` allowed by `$security.allowComponents`, or the `Vf*`
   * name derived from `type`), the content component for string cells (plain
   * text escaped; HTML via `$security.allowHtml: ['grid']`, sanitized after
   * expression resolution), or `null` for an empty cell.
   */
  component: string | Component | null

  /**
   * The props bound to `component`: the sanitized element schema for schema
   * cells, empty otherwise.
   */
  props: Record<string, any>

  /**
   * Number of columns this cell spans.
   */
  colspan: number

  /**
   * Number of rows this cell spans.
   */
  rowspan: number

  /**
   * Horizontal text alignment for the cell.
   */
  align: AlignProp

  /**
   * Vertical alignment for the cell.
   */
  valign: ValignProp

  /**
   * Additional HTML attributes applied to the cell element.
   */
  attrs: GridCellAttrs

  /**
   * The cell's row index in the grid schema.
   */
  row: number

  /**
   * The cell's column index in the grid schema.
   */
  col: number
}
```
