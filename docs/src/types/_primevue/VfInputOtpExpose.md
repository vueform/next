```ts
/**
 * Augmentable public API surface for VfInputOtp.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputOtpExpose` for all input-otp-based components) so
 * they appear on `ContextOf<'VfInputOtp'>` / `context$` / `defineExpose`.
 */
interface VfInputOtpExpose extends InputOtpExpose {}
```
