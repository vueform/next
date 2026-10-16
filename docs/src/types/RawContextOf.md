```ts
/**
 * Returns the context of a component without unwrapped refs. Currently an alias
 * of `ContextOf` (contexts are stored ref-unwrapped in the registry).
 */
type RawContextOf<
  T extends ComponentNames,
  TEntry = Record<string, any>,
> = ContextOf<T, TEntry>
```
