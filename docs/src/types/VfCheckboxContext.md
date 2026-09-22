```ts
/**
 * Public context for VfCheckbox, optionally parameterized by concrete props
 * (e.g. `VfCheckboxContext<VfCheckboxProps<1, 0>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfCheckboxContext<
  TProps extends WidenProps<VfCheckboxProps, CheckboxProps> = VfCheckboxProps,
> extends DefineElementContext<
  TProps,
  VfCheckboxEmits,
  VfCheckboxSlots,
  VfCheckboxParts,
  VfCheckboxClasses,
  VfCheckboxExpose,
  CheckboxApi<TProps>
> {}
```
