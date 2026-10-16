```ts
/**
 * Factory that resolves tree-select options, filtering out nodes whose
 * `conditions` prop evaluates to false. Clears selected values that become
 * unavailable when conditions change. Supports async options from a URL
 * endpoint, a function returning tree nodes, or a static array.
 */
const makeTreeOptions: (
  config?: unknown
) => (options: MakeTreeOptionsOptions) => {
  items: ComputedRef<TreeNode[]>
  resolving: ShallowRef<boolean, boolean>
  resolveItems: () => void
}
```
