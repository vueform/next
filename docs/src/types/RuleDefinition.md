```ts
/**
 * A stateless validation rule produced by `createRule`. Callable with
 * parameters to produce a configured copy (`min(3)`, `min({ min: 3 })`).
 */
type RuleDefinition<T extends readonly string[] | true = any> = ((
  ...args: any[]
) => RuleDefinition<T>) & {
  readonly [RULE_BRAND]: true
  readonly name: string
  readonly options?: RuleOptions<T>
  readonly attributes: RuleAttribute[]
  readonly conditions?: ConditionalProp
  readonly debounce: number
  readonly check: RuleChecker<T>
}
```
