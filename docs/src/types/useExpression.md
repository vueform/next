```ts
/**
 * Provides expression resolution utilities for evaluating dynamic string
 * expressions within form element props. Setup-only: throws when called outside
 * a component setup context. When the `expression` module is not registered,
 * uses the inert passthrough surface (`installed: false`).
 */
function useExpression(): {
  /**
   * Whether an expression engine is installed and available.
   */
  installed: MaybeRef<boolean>

  /**
   * Resolves dynamic expressions in a string value using the form model as
   * context. Passes `undefined` through unchanged.
   *
   * @param value The string value potentially containing expressions, or
   *   `undefined`.
   */
  resolve: <T extends string | undefined>(value: T) => Resolved<T>

  /**
   * Checks whether expression resolution is allowed for the given prop key.
   *
   * @param key The expressionable prop key to check.
   */
  allowed: (key: ExpressionableKeys) => boolean

  /**
   * Extracts the element paths referenced inside an expression chain string.
   *
   * @param expressionChain The raw expression string to scan.
   * @param path The base element path for resolving relative references.
   */
  usedPaths: (expressionChain: string, path?: string) => string[]

  /**
   * Resolves expressions in a string value only if expression resolution is
   * allowed for the given prop key. Passes `undefined` through unchanged.
   *
   * @param key The expressionable prop key to check against the allow list.
   * @param value The string value potentially containing expressions, or
   *   `undefined`.
   */
  resolveIfAllowed: <T extends string | undefined>(
    key: ExpressionableKeys,
    value: T
  ) => Resolved<T>

  /**
   * Warns (dev-only, once per app) that an expression engine is required. No-op
   * when the expression module is registered and enabled (built-in path adapter
   * or a plugin engine).
   */
  warn: () => void
}
```
