```ts
/**
 * Extracts the emit map for a given component from its registry entry,
 * optionally narrowed by a `TEntry` payload.
 */
type EmitsOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['emits']
```
