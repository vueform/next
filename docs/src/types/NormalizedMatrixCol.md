```ts
/**
 * A matrix column normalized from any accepted source format, with its value,
 * label, extracted metadata, and the original raw item.
 */
type NormalizedMatrixCol = {
  /**
   * The column's value used as the key in the row's data model.
   */
  value: string | number

  /**
   * The display label for this column header.
   */
  label: string | number | undefined

  /**
   * Conditional visibility rules for this column.
   */
  conditions: ConditionalProp | undefined

  /**
   * Schema definition for a custom element rendered in this column's cells.
   */
  schema: MatrixElement | undefined

  /**
   * Minimum width constraint for this column.
   */
  minWidth: string | number | undefined

  /**
   * Maximum width constraint for this column.
   */
  maxWidth: string | number | undefined

  /**
   * The original raw item the column was normalized from.
   */
  $raw: Record<string, any>
}
```
