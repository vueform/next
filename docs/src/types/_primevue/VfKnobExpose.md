```ts
/**
 * Augmentable public API surface for VfKnob.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `KnobExpose` for all knob-based components) so they
 * appear on `ContextOf<'VfKnob'>` / `context$` / `defineExpose`.
 */
interface VfKnobExpose extends KnobExpose {}
```
