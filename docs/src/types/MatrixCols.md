```ts
/**
 * Column definitions for the matrix: a record, an array of primitives (used as
 * both value and label), an array of column config objects (with keys
 * customizable via `colValue`, `colLabel`, and related props), an endpoint URL
 * string, or a (possibly async) function receiving the component context.
 */
type MatrixCols =
  | string
  | readonly string[]
  | Record<string, string | number>
  | readonly Record<string, any>[]
  | ((context$: any) => any)
```
