```ts
/**
 * Events emitted by the VfSlider component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfSliderSlots`. Plain usage (`VfSliderEmits`) keeps the
 * context wide.
 */
interface VfSliderEmits<TRange extends boolean = boolean> extends SliderEmits<
  VfSliderContext<VfSliderProps<TRange>>
> {}
```
