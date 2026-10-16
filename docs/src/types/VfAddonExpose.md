```ts
/**
 * Augmentable public API surface for VfAddon.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `AddonExpose` for all addon-based components) so they
 * appear on `ContextOf<'VfAddon'>` / `context$` / `defineExpose`.
 */
interface VfAddonExpose extends AddonExpose {}
```
