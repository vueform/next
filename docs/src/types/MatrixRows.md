```ts
/**
 * Row definitions for the matrix: a record, an array of primitives (used as
 * both value and label), an array of row config objects (with keys customizable
 * via `rowValue`, `rowLabel`, and related props), an endpoint URL string, or a
 * (possibly async) function receiving the component context.
 */
type MatrixRows =
  | string
  | readonly string[]
  | Record<string, any>
  | readonly Record<string, any>[]
  | ((context$: any) => any)
```
