```ts
/**
 * A bindings definition object or a factory that returns one: part-keyed bags
 * of attributes, or functions returning a bag for per-item parts.
 */
type BindingDefsArg<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = Record<string, any> | BindingDefsFactory<TApi, TPropRefs>
```
