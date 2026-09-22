```ts
/**
 * Augmentable public API surface for VfHidden.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `HiddenExpose` for all hidden-based components) so they
 * appear on `ContextOf<'VfHidden'>` / `context$` / `defineExpose`.
 */
interface VfHiddenExpose extends HiddenExpose {}
```
