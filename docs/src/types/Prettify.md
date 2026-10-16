```ts
/**
 * Simplifies a mapped or intersected type into a flat object type for better
 * IDE display.
 */
type Prettify<T> = { [K in keyof T]: T[K] } & {}
```
