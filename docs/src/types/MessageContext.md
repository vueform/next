```ts
/**
 * Context passed to rule message formatters including resolved parameters.
 */
type MessageContext<T extends readonly string[] | true = true> = RuleContext & {
  params: MessageParams<T>
}
```
