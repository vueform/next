```ts
/**
 * Augmentable public API surface for VfTextarea.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `TextareaExpose` for all textarea-based components) so
 * they appear on `ContextOf<'VfTextarea'>` / `context$` / `defineExpose`.
 */
interface VfTextareaExpose extends TextareaExpose {}
```
