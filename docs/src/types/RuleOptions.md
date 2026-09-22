```ts
/**
 * Options for defining a custom validation rule including check and message
 * functions.
 */
type RuleOptions<T extends readonly string[] | true = true> = {
  debounce?: number
  params?: T
  typed?: boolean
  /**
   * Extra element paths this rule depends on (beyond `$`-suffixed params). When
   * a dependency's value changes the rule revalidates, gated the same way as
   * `$`-param dependents (skip untouched, never-validated elements unless the
   * form has submitted).
   */
  deps?: string[] | ((ctx: CheckContext<T>) => string[])
  message?: string | ((messageContext: MessageContext<T>) => string)
  /**
   * Extra or overriding placeholders for the error message. Merged on top of
   * the default params (`attribute` plus declared rule params).
   */
  messageParams?: (
    messageContext: MessageContext<T>
  ) => Record<string, string | number | undefined>
  transformParams?: (context: { params: RawParams<T> }) => RawParams<T>
}
```
