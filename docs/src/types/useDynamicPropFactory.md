```ts
/**
 * Creates a factory function for resolving raw dynamic prop values into
 * expression-aware computeds. Helpers are bound once so the returned maker can
 * be invoked outside of setup (e.g. inside `reactiveComputed`).
 */
function useDynamicPropFactory(): MakeDynamicPropFn
```
