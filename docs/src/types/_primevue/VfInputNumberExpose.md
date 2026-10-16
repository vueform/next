```ts
/**
 * Augmentable public API surface for VfInputNumber.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputNumberExpose` for all input-number-based
 * components) so they appear on `ContextOf<'VfInputNumber'>` / `context$` /
 * `defineExpose`.
 */
interface VfInputNumberExpose extends InputNumberExpose {}
```
