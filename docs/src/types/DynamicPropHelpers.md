```ts
/**
 * Pre-resolved module helpers passed into the shared dynamic-prop computed
 * factory.
 */
type DynamicPropHelpers = {
  /**
   * Expression module instance used to resolve string expressions.
   */
  expression: ReturnType<typeof useExpression>

  /**
   * App config, when icon resolution is enabled.
   */
  config?: ReturnType<typeof useConfig>

  /**
   * Locale `localize` function, when localization is enabled.
   */
  localize?: (value: string | Record<string, string>) => string

  /**
   * The security module's `sanitizeHtml`, when sanitization is enabled.
   */
  sanitize?: (value?: string) => string

  /**
   * The security module's `sanitizeUrl`, when URL validation is enabled.
   */
  sanitizeUrl?: (url: unknown, schemes: string[]) => string | undefined
}
```
