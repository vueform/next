```ts
/**
 * Resolves the `grid` schema from a registry `TEntry` payload (unwrapping a
 * possible `Ref`), falling back to `undefined` when absent.
 */
type EntryGridOf<TEntry> =
  EntryPropOf<TEntry, 'grid'> extends infer G
    ? G extends Ref<infer V>
      ? V
      : G
    : undefined
```
