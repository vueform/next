```ts
/**
 * Augmentable public API surface for VfGrid.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `GridExpose` for all grid-based components) so they
 * appear on `ContextOf<'VfGrid'>` / `context$` / `defineExpose`.
 */
interface VfGridExpose extends GridExpose {}
```
