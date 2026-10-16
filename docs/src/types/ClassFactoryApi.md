```ts
/**
 * First argument to `useClasses` factories: the factory API plus event helpers
 * and the resolved (non-ref) `props` object.
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
