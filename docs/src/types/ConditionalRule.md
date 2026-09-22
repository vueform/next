```ts
/**
 * A rule or rule set that only runs when `$if` is met. `rules` accepts the same
 * forms as `RulesProp` (string, array, rule definition, Standard Schema).
 */
type ConditionalRule<TContext = any> = {
  /**
   * The rule or rules to apply while `$if` is true.
   */
  rules: RulesProp<TContext>

  /**
   * Conditions that must be met for `rules` to activate. Same syntax as element
   * `conditions`.
   */
  $if: ConditionalProp<TContext>
}
```
