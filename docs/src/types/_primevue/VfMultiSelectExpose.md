```ts
/**
 * Augmentable public API surface for VfMultiSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `MultiSelectExpose` for all multi-select-based
 * components) so they appear on `ContextOf<'VfMultiSelect'>` / `context$` /
 * `defineExpose`.
 */
interface VfMultiSelectExpose extends MultiSelectExpose {}
```
