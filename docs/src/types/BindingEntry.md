```ts
/**
 * One part's binding definition entry: ALWAYS a resolver function, invoked at
 * the consuming site with the template's call arguments (none for arg-less
 * parts). Every key of the `bindings` aggregate is uniformly a resolver —
 * there is no static/functional mode, so parts need no definition at all for
 * templates to resolve them with arguments (`bindings.item(file, index)`
 * works with zero entries, handing the arguments to user part overrides).
 */
type BindingEntry = (...args: any[]) => Record<string, any> | null | undefined
```
