```ts
/**
 * Augmentable public API surface for VfSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SelectExpose` for all select-based components) so they
 * appear on `ContextOf<'VfSelect'>` / `context$` / `defineExpose`.
 */
interface VfSelectExpose extends SelectExpose {}
```
