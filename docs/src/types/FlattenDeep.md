```ts
/**
 * Recursively flattens nested arrays into their element type.
 */
type FlattenDeep<T> = T extends readonly (infer U)[] ? FlattenDeep<U> : T
```
