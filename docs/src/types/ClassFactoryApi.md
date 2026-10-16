```ts
/**
 * First argument to `useClasses` factories: the factory API plus event helpers
 * and the resolved (non-ref) `props` object. Kept as a pick of assembled fields
 * rather than the full `Blueprint2Api` to avoid a circular type through
 * `useClasses`.
 */
type ClassFactoryApi<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
> = TApi &
  TEvents & {
    props: TProps
  }
```
