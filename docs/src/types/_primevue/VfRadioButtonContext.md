```ts
/**
 * Public context for VfRadioButton, optionally parameterized by concrete props
 * (e.g. `VfRadioButtonContext<VfRadioButtonProps<'a'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfRadioButtonContext<
  TProps extends WidenProps<VfRadioButtonProps, RadioButtonProps> =
    VfRadioButtonProps,
> extends DefineElementContext<
  TProps,
  VfRadioButtonEmits,
  VfRadioButtonSlots,
  VfRadioButtonParts,
  VfRadioButtonClasses,
  VfRadioButtonBindings,
  VfRadioButtonExpose,
  RadioButtonApi<TProps>
> {}
```
