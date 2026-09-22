```ts
/**
 * Augmentable public API surface for VfEditor.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `EditorExpose` for all editor-based components) so they
 * appear on `ContextOf<'VfEditor'>` / `context$` / `defineExpose`.
 */
interface VfEditorExpose extends EditorExpose {}
```
