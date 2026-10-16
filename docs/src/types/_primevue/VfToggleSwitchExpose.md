```ts
/**
 * Augmentable public API surface for VfToggleSwitch.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ToggleSwitchExpose` for all toggle-switch-based
 * components) so they appear on `ContextOf<'VfToggleSwitch'>` / `context$` /
 * `defineExpose`.
 */
interface VfToggleSwitchExpose extends ToggleSwitchExpose {}
```
