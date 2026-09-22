```ts
/**
 * Events emitted by the VfCheckbox component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfCheckboxSlots`. Plain usage
 * (`VfCheckboxEmits`) keeps the context wide.
 */
interface VfCheckboxEmits<
  TTrueValue = any,
  TFalseValue = any,
> extends CheckboxEmits<
  VfCheckboxContext<VfCheckboxProps<TTrueValue, TFalseValue>>
> {}
```
