```ts
/**
 * Makes the specified keys optional in a type while keeping the rest unchanged.
 */
type MakeOptional<T, K extends PropertyKey> = T extends any
  ? K extends keyof T
    ? Omit<T, K> & Partial<Pick<T, K>>
    : T
  : never
```
