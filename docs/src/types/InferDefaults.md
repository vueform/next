```ts
/**
 * Maps each prop to an optional default expressed as a factory or a matching
 * native literal.
 */
type InferDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>
}
```
