```ts
/**
 * Augmentable public API surface for VfListbox.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ListboxExpose` for all listbox-based components) so they
 * appear on `ContextOf<'VfListbox'>` / `context$` / `defineExpose`.
 */
interface VfListboxExpose extends ListboxExpose {}
```
