```ts
/**
 * Augmentable public API surface for VfText.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `TextExpose` for all text-based components) so they
 * appear on `ContextOf<'VfText'>` / `context$` / `defineExpose`.
 */
interface VfTextExpose extends TextExpose {}
```
