```ts
/**
 * Configuration options for the expression module (`config.$expression`).
 */
interface ExpressionModuleOptions {
  /**
   * Whether the expression system is enabled. When `false`, `createExpression`
   * returns the inert passthrough surface (`installed: false`) even when an
   * adapter is configured.
   */
  enabled?: boolean

  /**
   * Prop keys that allow expression resolution. When set to an array, only
   * listed keys are resolved. Defaults to all expressionable keys.
   */
  trigger?: ExpressionableKeys[]

  /**
   * Whether to log expression parse/evaluation warnings.
   */
  debug?: boolean

  /**
   * Custom expression functions keyed by name.
   */
  functions?: Record<string, Function>

  /**
   * Custom expression constants keyed by name.
   */
  consts?: Record<string, any>

  /**
   * The expression engine factory (e.g. `exprEvalAdapter`). Defaults to
   * `pathExpressionAdapter`, which resolves simple `{path}` interpolation
   * (`{name}`, `{user.name}`, `{list.0.name}`). Operators, function calls, and
   * other syntax require a plugin adapter.
   */
  adapter?: ExpressionAdapter
}
```
