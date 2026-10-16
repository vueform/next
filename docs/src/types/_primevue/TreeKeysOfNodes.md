```ts
/**
 * Recursively collects `key` literals from a tree node array.
 */
type TreeKeysOfNodes<T> = T extends readonly (infer N)[]
  ? TreeKeysOfNode<N>
  : never
```
