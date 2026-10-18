```ts
/**
 * A bindings definition factory that receives the component API and prop refs
 * when invoked — same calling convention as `useClasses` factories.
 */
type BindingDefsFactory<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => Record<string, any>
```
