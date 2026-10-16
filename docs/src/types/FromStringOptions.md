```ts
/**
 * Options for creating a component from a schema string.
 */
type FromStringOptions = {
  /**
   * The `$security.allowHtml` area the string belongs to.
   */
  htmlArea: SecurityHtmlArea

  /**
   * The expression allow-list key this string may resolve under — `{...}`
   * templates resolve when the key is allowed by the expression module (e.g.
   * `'slots'`). Omitted: the string never resolves expressions.
   */
  exprKey?: string
}
```
