```ts
/**
 * Applies an index diff to the store's data: added elements seed their
 * defaults, removed elements drop their slice.
 */
function reconcileData(store: ModelStore, diff: SchemaIndexDiff): void
```
