```ts
/**
 * Makes specific keys `K` of `T` required while leaving the rest unchanged.
 */
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
```
