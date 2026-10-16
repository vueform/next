```ts
/**
 * Identity mapped type for generic function parameters (no `& {}`, unlike
 * `Prettify` — safe for large generic contexts).
 *
 * Property access on a value typed as a bare type parameter widens to the
 * constraint's apparent type (`api.items` on `TApi extends DropdownApi` yields
 * `DropdownApi['items']`). Access on a mapped type over the parameter resolves
 * to the indexed access instead (`TApi['items']`), so blueprint extensions can
 * return prop-narrowed API fields without return annotations or casts.
 */
type Identity<T> = { [K in keyof T]: T[K] }
```
