```ts
/**
 * Per-node expression-tracking state, attached to `ModelNode.expression` while
 * the node has tracked templates.
 */
type ExpressionNodeState = {
  tracking: Ref<boolean>
  untrackOn: string[]
  sources: [string, string][]
  track: () => void
  untrack: () => void
  stopLoad?: () => void
}
```
