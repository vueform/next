```ts
/**
 * A structured validation issue produced by a field or model unit.
 */
type Issue = {
  /**
   * The element path the issue belongs to (`''` for root / unmatched).
   */
  path: string

  /**
   * The language key when the issue comes from a translatable rule set.
   */
  language?: string

  /**
   * The rule name that produced the issue (e.g. `'required'`, `'min'`,
   * `'standard_schema'`, `'validation_schema'`).
   */
  rule: string

  /**
   * The resolved, localized error message.
   */
  message: string
}
```
