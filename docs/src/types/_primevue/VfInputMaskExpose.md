```ts
/**
 * Augmentable public API surface for VfInputMask.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputMaskExpose` for all input-mask-based components) so
 * they appear on `ContextOf<'VfInputMask'>` / `context$` / `defineExpose`.
 */
interface VfInputMaskExpose extends InputMaskExpose {}
```
