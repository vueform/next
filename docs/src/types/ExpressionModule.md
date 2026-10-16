```ts
/**
 * The expression module instance, providing expression resolution and path
 * extraction.
 */
interface ExpressionModule {
  /**
   * Whether the expression module is registered and enabled. `true` for the
   * built-in path adapter and for plugin engines (e.g. expr-eval).
   */
  installed: MaybeRef<boolean>

  /**
   * Resolves an expression string against form data, returning the computed
   * string result. Returns `undefined` when the input expression is
   * `undefined`.
   *
   * @param exp The expression string (e.g. `'{field} > 5'`).
   * @param data The form data object to evaluate against.
   * @param context$ The element context for path/dataPath resolution and SELF.
   */
  resolve: {
    (exp: string, data?: Record<string, any>, context$?: any): string
    (exp: undefined, data?: Record<string, any>, context$?: any): undefined
    (
      exp: string | undefined,
      data?: Record<string, any>,
      context$?: any
    ): string | undefined
  }

  /**
   * Extracts the element paths referenced inside an expression chain string.
   *
   * @param expressionChain The raw expression string to scan.
   * @param path The base element path for resolving relative references.
   */
  usedPaths: (expressionChain: string, path?: string) => string[]

  /**
   * Warns (dev-only, once per app) that an expression engine is required. No-op
   * when the expression module is registered and enabled (built-in path adapter
   * or a plugin engine).
   */
  warn: () => void

  /**
   * Per-node `default`-value expression tracking over a model's schema index:
   * activation, node init / re-init / release, the mounted tracking facade
   * (`isTracking` / `track` / `untrack`), and user-event notifications.
   * Context-free — safe to call anywhere, including headless engines. The inert
   * surface returns a no-op tracking whose `activate` reports `false`.
   *
   * @param index The schema index the tracking operates on. May be `undefined`
   *   (standalone elements without a form) — index-dependent methods no-op.
   */
  makeExpressionTracking: (index?: SchemaIndex) => ExpressionTracking
}
```
