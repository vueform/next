```ts
/**
 * Tree node for the inspector, with mutable children array for tree building.
 */
interface TreeNode {
  id: string
  label: string
  tags: { label: string; textColor: number; backgroundColor: number }[]
  children: TreeNode[]
}
```
