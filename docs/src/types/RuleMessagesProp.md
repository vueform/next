```ts
/**
 * Custom validation messages keyed by rule name, supporting text props.
 */
type RuleMessagesProp<TContext = any> = Record<string, TProp<string, TContext>>
```
