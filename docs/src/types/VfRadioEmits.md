```ts
/**
 * Events emitted by the VfRadio component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfRadioSlots`. Plain usage (`VfRadioEmits`) keeps the
 * context wide.
 */
interface VfRadioEmits<TRadioValue = any> extends RadioEmits<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}
```
