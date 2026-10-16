```ts
/**
 * The low-level expression engine produced by an `ExpressionAdapter`. Deals
 * with single expressions only — the `{…}` template-chain format, `undefined`
 * passthrough, result normalization, and warning handling are owned by
 * `createExpression` and never reach the engine.
 */
interface ExpressionEngine {
  /**
   * Evaluates a single expression (the inner content of one `{…}` template)
   * against form data and returns the stringified result. Returns `undefined`
   * when the expression cannot be parsed. Throws when evaluation fails (e.g.
   * transient forward references, self-referencing expressions).
   *
   * @param expression The single expression to evaluate.
   * @param data The form data object to evaluate against.
   * @param context$ The element context for path/dataPath resolution and SELF.
   */
  evaluate: (
    expression: string,
    data?: Record<string, any>,
    context$?: any
  ) => string | undefined

  /**
   * Extracts the element paths referenced by a single expression.
   *
   * @param expression The single expression to scan.
   * @param path The base element path for resolving relative references.
   */
  variables: (expression: string, path?: string) => string[]
}
```
