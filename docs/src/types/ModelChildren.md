```ts
/**
 * Describes how a container element maps its children into the model, as
 * returned by a component's `children` model metadata function.
 */
type ModelChildren = {
  /**
   * Whether the container's children data lives merged at the parent's level
   * instead of nested under the container's own key (e.g. non-nested groups and
   * grids).
   */
  flat?: boolean

  /**
   * Whether the container's model is an array (e.g. list rows, dynamic matrix
   * rows). Entries are then keyed by stringified indices (`'0'`, `'1'`, …).
   */
  array?: boolean

  /**
   * The unified child schema structure: each key is a child name and each value
   * is the child's schema-entry props (including `type`).
   */
  entries: Record<string, Record<string, any>>
}
```
