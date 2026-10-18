```ts
/**
 * Augmentable public API surface for VfCheckboxes.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `CheckboxesExpose` for all checkboxes-based components)
 * so they appear on `ContextOf<'VfCheckboxes'>` / `context$` / `defineExpose`.
 */
interface VfCheckboxesExpose extends CheckboxesExpose {}
```
