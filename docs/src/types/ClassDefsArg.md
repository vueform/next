```ts
/**
 * A class definition object or a factory that returns one.
 */
type ClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | ClassDefsFactory<C, TApi, TPropRefs>
```
