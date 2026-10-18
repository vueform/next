```ts
/**
 * Augmentable public API surface for VfRadios.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadiosExpose` for all radios-based components) so they
 * appear on `ContextOf<'VfRadios'>` / `context$` / `defineExpose`.
 */
interface VfRadiosExpose extends RadiosExpose {}
```
