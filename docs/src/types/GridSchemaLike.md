```ts
/**
 * Readonly-compatible counterpart of `GridSchema` used as the inference
 * constraint in type-level helpers — `defineSchema`'s `const` narrowing turns
 * `grid` into readonly tuples, which never satisfy the mutable `GridSchema`.
 */
type GridSchemaLike = readonly (readonly (GridCellContent | GridCellSchema)[])[]
```
