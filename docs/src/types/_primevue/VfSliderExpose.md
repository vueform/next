```ts
/**
 * Augmentable public API surface for VfSlider.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `SliderExpose` for all slider-based components) so they
 * appear on `ContextOf<'VfSlider'>` / `context$` / `defineExpose`.
 */
interface VfSliderExpose extends SliderExpose {}
```
