```ts
/**
 * The per-index expression tracker, attached to `SchemaIndex.expressionTracker`
 * once tracking is activated.
 */
type ExpressionTracker = {
  init: (
    node: ModelNode,
    el$: () => any,
    initOptions?: ExpressionInitOptions
  ) => void
  release: (node: ModelNode) => void
}
```
