```ts
/**
 * Extracts keys from `T` whose value type is `boolean`.
 */
type BooleanKey<T, K extends keyof T = keyof T> = K extends any
  ? T[K] extends boolean
    ? K
    : never
  : never
```
