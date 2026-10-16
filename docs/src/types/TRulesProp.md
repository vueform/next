```ts
/**
 * The full rules prop type: either a single rule set or a language-keyed
 * object.
 */
type TRulesProp<TContext = any> = RulesProp<TContext> | TOnlyRulesProp<TContext>
```
