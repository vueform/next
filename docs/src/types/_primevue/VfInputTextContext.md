```ts
/**
 * Public context for VfInputText, optionally parameterized by concrete props
 * (e.g. `VfInputTextContext<VfInputTextProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfInputTextContext<
  TProps extends WidenProps<VfInputTextProps, InputTextProps> =
    VfInputTextProps,
> extends DefineElementContext<
  TProps,
  VfInputTextEmits,
  VfInputTextSlots,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextExpose,
  InputTextApi<TProps>
> {}
```
