```ts
/**
 * Checks whether an object type has exactly one key.
 */
type IsSingleKey<T> = keyof T & string extends infer K
  ? K extends any
    ? [Exclude<keyof T & string, K>] extends [never]
      ? true
      : false
    : never
  : never
```
