```ts
/**
 * A class definition factory that receives the component API and prop refs when
 * invoked (lazily, on first class-key access).
 */
type ClassDefsFactory<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => LooseClasses<C>
```
