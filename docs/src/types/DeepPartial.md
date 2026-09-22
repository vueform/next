```ts
/**
 * Recursively makes all properties of an object type optional, while preserving
 * arrays as-is.
 */
type DeepPartial<T> = T extends any[]
  ? T
  : T extends Record<string, any>
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T
```
