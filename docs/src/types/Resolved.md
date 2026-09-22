```ts
/**
 * Expression resolve result: `string` when the input is a string, otherwise
 * `undefined`.
 */
type Resolved<T extends string | undefined> = T extends string
  ? string
  : undefined
```
