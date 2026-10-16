```ts
/**
 * Blueprint API overlay for elements that use `makeData` / `makeRData`. Caches
 * the wide `Base` (typically `ReturnType<typeof blueprint>`) and re-binds only
 * the prop-dependent model slice to `P`.
 */
type ModelApi<Base, P> = Omit<Base, keyof MakeDataModelApi> &
  MakeDataModelApi<P>
```
