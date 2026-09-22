```ts
/**
 * A single validation rule string — either a bare rule name or a rule with
 * colon-separated parameters (e.g. `'min:3'`). Accepts custom rule names via
 * the `string & {}` fallback.
 */
type RuleString = RuleName | `${RuleName}:${string}` | (string & {})
```
