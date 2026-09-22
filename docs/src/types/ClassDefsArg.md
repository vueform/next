```ts
/**
 * A class definition object or a factory that returns one. Factories are
 * deferred until first key access and receive `(api, propRefs)` so they need
 * not close over setup bindings.
 */
type ClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | ClassDefsFactory<C, TApi, TPropRefs>
```
