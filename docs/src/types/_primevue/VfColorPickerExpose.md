```ts
/**
 * Augmentable public API surface for VfColorPicker.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ColorPickerExpose` for all color-picker-based
 * components) so they appear on `ContextOf<'VfColorPicker'>` / `context$` /
 * `defineExpose`.
 */
interface VfColorPickerExpose extends ColorPickerExpose {}
```
