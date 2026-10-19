```ts
/**
 * Resolves a functional aspect member to the bag it returns; plain members
 * pass through.
 */
type ResolvedSurfaceMember<T> =
  NonNullable<T> extends (...args: any[]) => infer R ? R : NonNullable<T>
```
