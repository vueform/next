```ts
/**
 * Augmentable public API surface for VfList.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ListExpose` for all list-based components) so they
 * appear on `ContextOf<'VfList'>` / `context$` / `defineExpose`.
 */
interface VfListExpose extends ListExpose {}
```
