```ts
/**
 * Type-only key carrying `ItemsProps` generics for consumers like
 * `MakeItemsReturn<P>`. A `unique symbol`, so it never appears among prop
 * completions. Never set (nor existing) at runtime.
 */
const itemsGenericsBrandKey: typeof itemsGenericsBrandKey
```
