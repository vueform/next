```ts
/**
 * Like `Required<T>` but preserves the original property types without removing
 * `undefined`.
 */
type LooseRequired<T> = {
  [P in keyof (T & Required<T>)]: T[P]
}
```
