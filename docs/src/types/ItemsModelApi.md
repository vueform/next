```ts
/**
 * Blueprint API overlay for elements that use `makeData` and `makeItems`.
 * Caches the wide `Base` (typically `ReturnType<typeof blueprint>`) and
 * re-binds the prop-dependent model slice plus `items` / `groups`.
 */
type ItemsModelApi<Base, P> = Omit<
  Base,
  keyof MakeDataModelApi | 'items' | 'groups'
> &
  MakeDataModelApi<P> &
  Pick<MakeItemsReturn<P>, 'items' | 'groups'>
```
