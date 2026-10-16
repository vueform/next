```ts
/**
 * Creates an expression instance from the given app config (uses the
 * `$expression` enabled flag and adapter). Falls back to the inert passthrough
 * surface (`installed: false`) when disabled or when no adapter is registered —
 * register one via `$expression: { adapter }` (`pathExpressionAdapter` for
 * plain `{path}` interpolation, or `@vueform/expr-eval`). Owns everything
 * engine-independent: the `{…}` template-chain format and escapes, `undefined`
 * passthrough, result normalization, and the transient-warning queue — the
 * adapter's engine only evaluates single expressions and reports their paths.
 *
 * @param vueform The owning instance (only `config.$expression` is used).
 */
function createExpression(vueform: VueformInstance): ExpressionModule
```
