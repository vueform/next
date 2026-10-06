```ts
/**
 * A validation rules definition as a pipe-separated string, a Standard Schema
 * (Zod, Valibot, ArkType, …), a rule definition, a conditional rule, or an
 * array of strings, conditional rules, rule definitions, or Standard Schemas.
 */
type RulesProp<TContext = any> =
  | RuleString
  | `${RuleName}|${string}`
  | `${RuleName}:${string}|${string}`
  | StandardSchemaV1
  | RuleDefinition
  | ConditionalRule<TContext>
  | (
      | RuleString
      | ConditionalRule<TContext>
      | RuleDefinition
      | StandardSchemaV1
    )[]
```
