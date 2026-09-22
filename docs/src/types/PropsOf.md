```ts
/**
 * Extracts the props type for a given component from its registry entry,
 * optionally narrowed by a `TEntry` payload.
 */
type PropsOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ComponentRegistry<TEntry>[T]['props']
```
