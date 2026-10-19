```ts
/**
 * Resolves a functional aspect member to the bag it returns; plain bags pass
 * through.
 */
type ResolvedAspect<T> = T extends (...args: any[]) => infer R ? R : T
```
