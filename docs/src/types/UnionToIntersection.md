```ts
/**
 * Converts a union type into an intersection by distributing over function
 * parameter positions.
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never
```
