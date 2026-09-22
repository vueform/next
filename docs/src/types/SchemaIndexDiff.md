```ts
type SchemaIndexDiff = {
  added: ModelNode[]
  removed: ModelNode[]
  changed: { node: ModelNode; prev: ReconciledNodePrev }[]
  model: Record<string, any>
}
```
