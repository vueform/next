```ts
/**
 * Augmentable public API surface for VfNav.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `NavExpose` for all nav-based components) so they appear
 * on `ContextOf<'VfNav'>` / `context$` / `defineExpose`.
 */
interface VfNavExpose extends NavExpose {}
```
