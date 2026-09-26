```ts
/**
 * Props for the VfInputOtp component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfInputOtpProps extends InputOtpProps<
  'input-otp',
  VfInputOtpSlots,
  VfInputOtpParts,
  VfInputOtpClasses,
  VfInputOtpContext
> {}
```
