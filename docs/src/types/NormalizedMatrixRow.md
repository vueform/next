```ts
/**
 * A matrix row normalized from any accepted source format, with its value,
 * label, extracted metadata, and the original raw item.
 */
type NormalizedMatrixRow = {
  /**
   * The row's value used as the key in the matrix data model.
   */
  value: string | number

  /**
   * The display label for this row header.
   */
  label: string | number | undefined

  /**
   * Conditional visibility rules for this row.
   */
  conditions: ConditionalProp | undefined

  /**
   * Validation rules applied to this row.
   */
  rules: RulesProp | undefined

  /**
   * The original raw item the row was normalized from.
   */
  $raw: Record<string, any>
}
```
