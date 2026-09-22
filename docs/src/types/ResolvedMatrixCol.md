```ts
/**
 * A fully resolved matrix column with its component, value, label, and width
 * constraints.
 */
type ResolvedMatrixCol = {
  /**
   * The resolved component for this column's input: an explicit `component`
   * allowed by `$security.allowComponents`, or the `Vf*` name derived from
   * `type` (e.g. VfRadio, VfCheckbox, VfText).
   */
  component: string | Component

  /**
   * The element schema props passed to the column component.
   */
  props: MatrixElementSchema

  /**
   * The column's value used as the key in the row's data model.
   */
  value: string | number

  /**
   * The display label for this column header.
   */
  label: string

  /**
   * Conditional visibility rules for this column.
   */
  conditions: ConditionalProp | undefined

  /**
   * Reactive boolean indicating whether the column is currently visible.
   */
  available: Ref<boolean>

  /**
   * Minimum width constraint for this column.
   */
  minWidth: string | number | undefined

  /**
   * Maximum width constraint for this column.
   */
  maxWidth: string | number | undefined

  /**
   * The unique DOM id for this column, used for ARIA references.
   */
  id: string
}
```
