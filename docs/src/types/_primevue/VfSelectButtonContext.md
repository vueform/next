```ts
/**
 * Public context for VfSelectButton, optionally parameterized by concrete props
 * (e.g. `VfSelectButtonContext<VfSelectButtonProps<typeof options, 'id'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfSelectButtonContext<
  TProps extends WidenProps<
    VfSelectButtonProps,
    SelectButtonProps<string, OptionsProp, OptionValueProp>
  > = VfSelectButtonProps,
> extends DefineElementContext<
  TProps,
  VfSelectButtonEmits,
  VfSelectButtonSlots,
  VfSelectButtonParts,
  VfSelectButtonClasses,
  VfSelectButtonModifiers,
  VfSelectButtonA11y,
  VfSelectButtonExpose,
  SelectButtonApi<TProps>
> {}
```
