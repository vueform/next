```ts
/**
 * Registry entry for VfInputOtp. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfInputOtp has no prop-driven generics.
 */
interface VfInputOtpEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfInputOtpProps,
  VfInputOtpEmits,
  VfInputOtpSlots,
  VfInputOtpParts,
  VfInputOtpClasses,
  VfInputOtpContext
> {}
```
