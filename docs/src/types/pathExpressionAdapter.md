```ts
/**
 * The built-in path-only expression adapter: no dependencies, resolves simple
 * `{path}` interpolation against form data (`name`, `user.name`,
 * `list.0.name`). Operators, function calls, and other syntax are left literal
 * and warn once in dev to install `@vueform/expr-eval`. Register it via
 * `$expression: { adapter: pathExpressionAdapter }` (the ui / primevue entries
 * do so by default).
 */
const pathExpressionAdapter: ExpressionAdapter
```
