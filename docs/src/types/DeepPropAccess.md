```ts
/**
 * Deeply accesses a type by a dot-separated path string, resolving to `any`
 * when the path cannot be followed.
 */
type DeepPropAccess<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? DeepPropAccess<T[K], R>
    : any
  : P extends keyof T
    ? T[P]
    : any
```
