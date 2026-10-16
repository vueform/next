```ts
/**
 * Stores all component definitions. Components that are not elements (e.g.
 * `VfForm`, `VfNav`) register directly to this.
 */
interface ComponentRegistry<
  TEntry = Record<string, any>,
> extends ElementRegistry<TEntry> {}
```
