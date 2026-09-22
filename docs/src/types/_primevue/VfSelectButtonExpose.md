```ts
/**
 * Augmentable public API surface for VfSelectButton.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SelectButtonExpose` for all select-button-based
 * components) so they appear on `ContextOf<'VfSelectButton'>` / `context$` /
 * `defineExpose`.
 */
interface VfSelectButtonExpose extends SelectButtonExpose {}
```
