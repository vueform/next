```ts
/**
 * Stores all element definitions (no direct registration — combined from the
 * family registries).
 */
interface ElementRegistry<TEntry = Record<string, any>>
  extends
    ControlRegistry<TEntry>,
    GroupRegistry<TEntry>,
    ListRegistry<TEntry>,
    GridRegistry<TEntry>,
    MatrixRegistry<TEntry> {}
```
