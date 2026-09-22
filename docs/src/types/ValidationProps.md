```ts
/**
 * Props for elements that support validation rules and error display.
 */
interface ValidationProps<TContext = any> {
  /**
   * Validation rules to apply to the element.
   */
  rules?: RulesProp<TContext>

  /**
   * Whether to stop validation after the first failing rule.
   */
  bail?: boolean

  /**
   * Custom error messages keyed by validation rule name.
   */
  ruleMessages?: RuleMessagesProp<TContext>

  /**
   * The display name used in validation error messages.
   */
  displayName?: TProp<string, TContext>

  /**
   * Maximum number of validation errors to display at once.
   */
  maxErrors?: number

  /**
   * Whether to hide validation error messages.
   */
  hideErrors?: boolean

  /**
   * Where to show required field indicators (e.g. label, placeholder).
   */
  showRequired?: ShowRequiredProp

  /**
   * Delay in milliseconds before processing input.
   */
  debounce?: number

  /**
   * Whether to push the element's errors to its nearest ancestor element.
   */
  hoist?: boolean

  /**
   * Controls when validation is triggered (e.g. on change, blur, or submit).
   */
  validateOn?: ElementValidateOnProp
}
```
