```ts
/**
 * Augmentable public API surface for VfCheckbox.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CheckboxExpose` for all checkbox-based components) so
 * they appear on `ContextOf<'VfCheckbox'>` / `context$` / `defineExpose`.
 */
interface VfCheckboxExpose extends CheckboxExpose {}
```
