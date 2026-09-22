```ts
/**
 * Augmentable public API surface for VfPassword.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `PasswordExpose` for all password-based components) so
 * they appear on `ContextOf<'VfPassword'>` / `context$` / `defineExpose`.
 */
interface VfPasswordExpose extends PasswordExpose {}
```
