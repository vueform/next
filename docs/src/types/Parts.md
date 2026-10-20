```ts
/**
 * The resolved part-override surface of a component: the user's `part:<key>`
 * props / attrs and `parts` prop, keyed by the component's part vocabulary.
 * Every key is the part's override resolver — `parts.root()`,
 * `parts.item(file, index)` — returning the sanitized override bag (a function
 * override is invoked with the call-site arguments plus the component context
 * appended last), or `undefined` when there is no override. `Object.keys` /
 * the `in` operator enumerate the overridden keys. Consumed by
 * `defineAggregateBindings` (every `bindings.X()` call merges the override on
 * top of the registered definitions), and exposed as the context's `parts`
 * member for presence questions the merged bag cannot answer — `VfLayout`'s
 * passthrough root renders a wrapper `<div>` only when `el$.parts.root()` says
 * a raw override exists.
 */
type Parts<TParts = Record<string, any>> = {
  [K in keyof TParts]-?: (
    ...args: PartArgsOf<TParts[K]>
  ) => Record<string, any> | undefined
} & Record<string, (...args: any[]) => Record<string, any> | undefined>
```
