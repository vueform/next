```ts
/**
 * Extracts keys that are optional in the given type.
 */
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]
```
