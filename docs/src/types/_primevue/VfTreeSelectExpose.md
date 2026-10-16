```ts
/**
 * Augmentable public API surface for VfTreeSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `TreeSelectExpose` for all tree-select-based components)
 * so they appear on `ContextOf<'VfTreeSelect'>` / `context$` / `defineExpose`.
 */
interface VfTreeSelectExpose extends TreeSelectExpose {}
```
