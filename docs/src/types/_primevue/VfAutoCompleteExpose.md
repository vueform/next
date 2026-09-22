```ts
/**
 * Augmentable public API surface for VfAutoComplete.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `AutoCompleteExpose` for all auto-complete-based
 * components) so they appear on `ContextOf<'VfAutoComplete'>` / `context$` /
 * `defineExpose`.
 */
interface VfAutoCompleteExpose extends AutoCompleteExpose {}
```
