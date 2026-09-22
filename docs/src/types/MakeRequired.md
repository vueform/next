```ts
/**
 * Makes the specified keys required in a type while keeping the rest unchanged.
 */
type MakeRequired<T, K extends PropertyKey> = T extends any
  ? K extends keyof T
    ? Omit<T, K> & Required<Pick<T, K>>
    : T
  : never
```
