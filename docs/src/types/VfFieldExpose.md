```ts
/**
 * Augmentable public API surface for VfField.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FieldExpose` for all field-based components) so they
 * appear on `ContextOf<'VfField'>` / `context$` / `defineExpose`.
 */
interface VfFieldExpose extends FieldExpose {}
```
