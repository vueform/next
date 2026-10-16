```ts
/**
 * The inert expression surface (`installed: false`) used when the `expression`
 * module is not registered or is disabled (`enabled: false`) — behaves as if
 * expressions weren't there: `resolve` passes input through untouched, no paths
 * are ever reported as used, and tracking never activates. `warn()` fires once
 * in dev when a feature actually requires an engine.
 */
const noopExpression: ExpressionModule
```
