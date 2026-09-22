```ts
/**
 * A validation rule attribute with a display value and optional field name.
 */
/**
 * Per-language (or `'default'`) read-only view of an owner's validation state.
 * Shape-compatible with the former `ElementValidation` so `el$.validation` /
 * `el$.currentValidation` keep working.
 */
type ValidationView = {
  /**
   * The language key used for multilingual validation.
   */
  language: string | undefined

  /**
   * Whether any active unit is currently invalid.
   */
  invalid: ComputedRef<boolean>

  /**
   * Whether any async unit is awaiting a result.
   */
  pending: ComputedRef<boolean>

  /**
   * Whether any unit is waiting for its debounce timer.
   */
  debouncing: ComputedRef<boolean>

  /**
   * Whether validation is pending or debouncing.
   */
  busy: ComputedRef<boolean>

  /**
   * Whether a `required` or `accepted` unit is active.
   */
  required: ComputedRef<boolean>

  /**
   * Aggregated error messages from invalid units.
   */
  errors: ComputedRef<string[]>

  /**
   * Structured issues from invalid units.
   */
  issues: ComputedRef<Issue[]>

  /**
   * Whether every active unit has been run at least once.
   */
  validated: ComputedRef<boolean>

  /**
   * Runs this language's units against the given value (or the owner's current
   * value when omitted).
   *
   * @param value The value to validate.
   */
  validate: (value?: any) => Promise<boolean>

  /**
   * Marks units as not yet validated, requiring re-validation.
   */
  invalidate: () => void

  /**
   * Resets units to their initial state.
   */
  reset: () => void
}
```
