```ts
/**
 * Events emitted by the VfToggleSwitch component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfToggleSwitchSlots`. Plain usage
 * (`VfToggleSwitchEmits`) keeps the context wide.
 */
interface VfToggleSwitchEmits<
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchEmits<
  VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
> {}
```
