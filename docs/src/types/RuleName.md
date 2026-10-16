```ts
/**
 * Union of all known validation rule names — built-in rules plus any
 * user-registered custom rules from `CustomRules`.
 */
type RuleName = BuiltInRules | keyof CustomRules
```
