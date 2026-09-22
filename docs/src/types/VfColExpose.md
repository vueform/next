```ts
/**
 * Augmentable public API surface for VfCol.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ColExpose` for all col-based components) so they appear
 * on `ContextOf<'VfCol'>` / `context$` / `defineExpose`.
 */
interface VfColExpose extends ColExpose {}
```
