```ts
/**
 * Augmentable public API surface for VfLayout.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `LayoutExpose` for all element-layout-based components)
 * so they appear on `ContextOf<'VfLayout'>` / `context$` / `defineExpose`.
 */
interface VfLayoutExpose extends LayoutExpose {}
```
