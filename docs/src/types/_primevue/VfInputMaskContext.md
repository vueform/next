```ts
/**
 * Public context for VfInputMask, optionally parameterized by concrete props
 * (e.g. `VfInputMaskContext<VfInputMaskProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfInputMaskContext<
  TProps extends WidenProps<VfInputMaskProps, InputMaskProps> =
    VfInputMaskProps,
> extends DefineElementContext<
  TProps,
  VfInputMaskEmits,
  VfInputMaskSlots,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskModifiers,
  VfInputMaskA11y,
  VfInputMaskExpose,
  InputMaskApi<TProps>
> {}
```
