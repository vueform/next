```ts
/**
 * Wraps a type to also accept a contextual function that receives the component
 * context and returns the value.
 *
 * @param context$ The component context passed when used as a function.
 */
type MaybeContextual<T, TContext = any> = T | ((context$: TContext) => T | void)
```
