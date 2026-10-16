```ts
/**
 * Either a factory that receives props and returns the default, or a literal
 * value when it is a native type.
 */
type InferDefault<P, T> =
  | ((props: P) => T & {})
  | (T extends NativeType ? T : never)
```
