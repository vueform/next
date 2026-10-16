```ts
/**
 * Resolves a `TRange` generic from a registry `TEntry` payload's `range` prop,
 * defaulting to `false` when absent or invalid.
 */
type EntryRangeOf<TEntry> =
  EntryPropOf<TEntry, 'range'> extends infer R
    ? R extends boolean
      ? R
      : false
    : false
```
