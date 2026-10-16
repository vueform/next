```ts
/**
 * Context passed to rule check functions including resolved parameters.
 */
type CheckContext<T extends readonly string[] | true = true> = RuleContext & {
  params: ValidatorParams<T>
}
```
