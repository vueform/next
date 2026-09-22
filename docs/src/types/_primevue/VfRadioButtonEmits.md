```ts
/**
 * Events emitted by the VfRadioButton component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfRadioButtonSlots`. Plain usage
 * (`VfRadioButtonEmits`) keeps the context wide.
 */
interface VfRadioButtonEmits<TRadioValue = any> extends RadioButtonEmits<
  VfRadioButtonContext<VfRadioButtonProps<TRadioValue>>
> {}
```
