```ts
/**
 * Augmentable public API surface for VfRadio.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadioExpose` for all radio-based components) so they
 * appear on `ContextOf<'VfRadio'>` / `context$` / `defineExpose`.
 */
interface VfRadioExpose extends RadioExpose {}
```
