```ts
/**
 * Augmentable public API surface for VfMatrix.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `MatrixExpose` for all matrix-based components) so they
 * appear on `ContextOf<'VfMatrix'>` / `context$` / `defineExpose`.
 */
interface VfMatrixExpose extends MatrixExpose {}
```
