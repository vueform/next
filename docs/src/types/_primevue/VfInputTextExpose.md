```ts
/**
 * Augmentable public API surface for VfInputText.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputTextExpose` for all input-text-based components) so
 * they appear on `ContextOf<'VfInputText'>` / `context$` / `defineExpose`.
 */
interface VfInputTextExpose extends InputTextExpose {}
```
