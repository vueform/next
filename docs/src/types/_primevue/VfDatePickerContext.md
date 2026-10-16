```ts
/**
 * Public context for VfDatePicker, optionally parameterized by concrete props
 * (e.g. `VfDatePickerContext<VfDatePickerProps<'multiple'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfDatePickerContext<
  TProps extends WidenProps<VfDatePickerProps, DatePickerProps> =
    VfDatePickerProps,
> extends DefineElementContext<
  TProps,
  VfDatePickerEmits,
  VfDatePickerSlots,
  VfDatePickerParts,
  VfDatePickerClasses,
  VfDatePickerExpose,
  DatePickerApi<TProps>
> {}
```
