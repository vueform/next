```ts
/**
 * Augmentable public API surface for VfGroup.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `GroupExpose` for all group-based components) so they
 * appear on `ContextOf<'VfGroup'>` / `context$` / `defineExpose`.
 */
interface VfGroupExpose extends GroupExpose {}
```
