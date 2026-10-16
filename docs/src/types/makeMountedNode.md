```ts
/**
 * Creates an index node for a mounted element the schema walk didn't produce
 * (template-driven elements, or list rows added beyond the initial count). Only
 * identity facts are known up front — the claimed component context carries the
 * live state.
 *
 * @param facts The element's path and data path.
 */
function makeMountedNode(facts: { path: string; dataPath?: string }): ModelNode
```
