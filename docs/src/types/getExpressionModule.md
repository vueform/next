```ts
/**
 * Returns the resolved instance's expression module, or the inert
 * `noopExpression` surface (`installed: false`, passthrough `resolve`) when the
 * `expression` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
function getExpressionModule(vueform?: VueformInstance): ExpressionModule
```
