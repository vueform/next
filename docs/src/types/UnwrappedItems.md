```ts
/**
 * Unwraps function and async-function item sources to their resolved data
 * shape.
 */
type UnwrappedItems<T> = T extends (...args: any[]) => infer R
  ? UnwrappedItems<Awaited<R>>
  : T
```
