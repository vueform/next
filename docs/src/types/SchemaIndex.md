```ts
/**
 * The result of a schema walk: the node tree plus the default model (with
 * `modelValue` / `default` precedence applied) and the matching null-value
 * tree, all derived from the same traversal.
 */
type SchemaIndex = {
  /**
   * Top-level nodes by name.
   */
  root: Map<string, ModelNode>

  /**
   * All nodes in the tree, keyed by element path for O(1) lookup.
   */
  nodes: Map<string, ModelNode>

  /**
   * The complete default model derived from the schema.
   */
  model: Record<string, any>

  /**
   * The null-value tree matching the model's shape, used for `clear()` and
   * `empty` checks.
   */
  nullModel: Record<string, any>

  /**
   * Bumped whenever the index's mounted bindings change (a node is claimed or
   * released, or a validation map is attached), so engine aggregates depending
   * on them re-collect.
   */
  version: Ref<number>

  /**
   * The expression tracker attached by the expression module once tracking is
   * activated for this index (one per index, shared by the headless engine and
   * the mounted form).
   */
  expressionTracker?: ExpressionTracker
}
```
