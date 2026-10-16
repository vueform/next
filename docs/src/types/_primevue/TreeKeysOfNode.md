```ts
/**
 * Keys from one tree node and its descendants.
 */
type TreeKeysOfNode<N> =
  | (N extends { key: infer K extends string | number } ? K : never)
  | (N extends { children?: infer C }
      ? C extends readonly any[]
        ? TreeKeysOfNodes<C>
        : never
      : never)
```
