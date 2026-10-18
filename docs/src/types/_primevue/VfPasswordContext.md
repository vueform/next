```ts
/**
 * Public context for VfPassword, optionally parameterized by concrete props
 * (e.g. `VfPasswordContext<VfPasswordProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfPasswordContext<
  TProps extends WidenProps<VfPasswordProps, PasswordProps> = VfPasswordProps,
> extends DefineElementContext<
  TProps,
  VfPasswordEmits,
  VfPasswordSlots,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordModifiers,
  VfPasswordA11y,
  VfPasswordExpose,
  PasswordApi<TProps>
> {}
```
