```ts
/**
 * Augmentable public API surface for VfCascadeSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CascadeSelectExpose` for all cascade-select-based
 * components) so they appear on `ContextOf<'VfCascadeSelect'>` / `context$` /
 * `defineExpose`.
 */
interface VfCascadeSelectExpose extends CascadeSelectExpose {}
```
