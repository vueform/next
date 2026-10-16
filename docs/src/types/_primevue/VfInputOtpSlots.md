```ts
/**
 * Slots available in the VfInputOtp component.
 */
interface VfInputOtpSlots
  extends
    InputOtpSlots<VfInputOtpContext>,
    FloatLabelSlots,
    IftaSlots,
    /* @vue-ignore */ ForwardedSlots<
      AInputOtpSlots,
      (typeof forwards.slots)[number]
    > {}
```
