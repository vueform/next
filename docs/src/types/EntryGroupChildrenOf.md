```ts
/**
 * Resolves the `TGroupChildren` generic from a registry `TEntry` payload's
 * `groupChildren` prop, coerced to the `GroupChildrenProp` bound.
 */
type EntryGroupChildrenOf<TEntry> =
  EntryPropOf<TEntry, 'groupChildren'> extends infer G
    ? G extends GroupChildrenProp
      ? G
      : undefined
    : undefined
```
