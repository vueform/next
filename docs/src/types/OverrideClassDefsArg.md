```ts
/**
 * An override definition registered from outside the component (custom
 * templates / slots): a part-keyed object or a factory that returns one.
 * Factories here run inside each consuming key's computed.
 */
type OverrideClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | OverrideClassDefsFactory<C, TApi, TPropRefs>
```
