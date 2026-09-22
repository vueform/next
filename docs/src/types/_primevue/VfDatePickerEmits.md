```ts
/**
 * Events emitted by the VfDatePicker component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfDatePickerSlots`. Plain usage
 * (`VfDatePickerEmits`) keeps the context wide.
 */
interface VfDatePickerEmits<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
> extends DatePickerEmits<
  VfDatePickerContext<VfDatePickerProps<TSelectionMode>>
> {}
```
