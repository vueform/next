```ts
/**
 * Allowed types for the tree-select `options` prop: a static array of tree
 * nodes, an endpoint URL string, or a function returning tree nodes (sync or
 * async). Arrays may be mutable or `readonly` / `as const` tuples so literal
 * key unions can drive selection-keys model inference.
 *
 * The array arm is `readonly any[]` (not `TreeNode[]`) so `as const` trees —
 * whose nested `children` are readonly — remain assignable.
 */
type TreeOptionsProp = readonly any[] | string | ((context$: any) => any)
```
