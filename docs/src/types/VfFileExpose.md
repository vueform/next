```ts
/**
 * Augmentable public API surface for VfFile.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FileExpose` for all file-based components) so they
 * appear on `ContextOf<'VfFile'>` / `context$` / `defineExpose`.
 */
interface VfFileExpose extends FileExpose {}
```
