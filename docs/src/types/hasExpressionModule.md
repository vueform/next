```ts
/**
 * Whether an expression module is registered — `false` means
 * `getExpressionModule` serves the inert `noopExpression` surface. Note this is
 * registration only: a registered module can still be inert (`installed:
 * false`) when `$expression.enabled` is `false`.
 */
function hasExpressionModule(vueform?: VueformInstance): boolean
```
