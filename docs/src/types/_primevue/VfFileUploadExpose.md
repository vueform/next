```ts
/**
 * Augmentable public API surface for VfFileUpload.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FileUploadExpose` for all file-upload-based components)
 * so they appear on `ContextOf<'VfFileUpload'>` / `context$` / `defineExpose`.
 */
interface VfFileUploadExpose extends FileUploadExpose {}
```
