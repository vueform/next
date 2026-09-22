```ts
/**
 * Function that performs the actual validation check.
 */
type RuleChecker<T extends readonly string[] | true = true> = (
  value: any,
  ruleContext: CheckContext<T>
) => boolean | string | Promise<boolean | string>
```
