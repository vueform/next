```ts
/**
 * Per-owner rollup of validation state across languages, plus per-language
 * views.
 */
type OwnerView = {
  /**
   * Per-language views keyed by language (`'default'` when not translatable).
   */
  languages: Record<string, ValidationView>

  /**
   * Whether any language is invalid.
   */
  invalid: ComputedRef<boolean>

  /**
   * Whether any language is pending.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any language is debouncing.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether every language has been validated.
   */
  validated: ComputedRef<boolean>

  /**
   * Aggregated error messages across languages.
   */
  errors: ComputedRef<string[]>

  /**
   * Structured issues across languages.
   */
  issues: ComputedRef<Issue[]>
}
```
