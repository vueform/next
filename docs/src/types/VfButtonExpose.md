```ts
/**
 * Augmentable public API surface for VfButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ButtonExpose` for all button-based components) so they
 * appear on `ContextOf<'VfButton'>` / `context$` / `defineExpose`.
 */
interface VfButtonExpose extends ButtonExpose {}
```
