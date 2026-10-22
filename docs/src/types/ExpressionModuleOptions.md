```ts
/**
 * Configuration options for the expression module (`config.$expression`).
 */
interface ExpressionModuleOptions {
  /**
   * Whether the expression system is enabled. Defaults to `true` (with or
   * without a plugin adapter). When `false`, `createExpression` returns the
   * inert passthrough surface (`installed: false`) and all expression
   * resolution is disabled, even when an adapter is configured.
   */
  enabled?: boolean

  /**
   * The prop keys that resolve expressions. Unset, every expressionable prop
   * resolves. An array restricts resolution to the listed keys — strings match
   * exactly, RegExps as written.
   */
  whitelist?: ExpressionWhitelistProp

  /**
   * Whether forms may define their own expression constants via the `consts`
   * prop. Defaults to `true`; when `false`, a form's `consts` prop has no
   * effect (only `$expression.consts` entries are available).
   */
  localConsts?: boolean

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
