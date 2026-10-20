```ts
/**
 * Public context for VfSlider, optionally parameterized by concrete props (e.g.
 * `VfSliderContext<VfSliderProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfSliderContext<
  TProps extends WidenProps<VfSliderProps, SliderProps> = VfSliderProps,
> extends DefineElementContext<
  TProps,
  VfSliderEmits,
  VfSliderSlots,
  VfSliderParts,
  VfSliderClasses,
  VfSliderBindings,
  VfSliderExpose,
  SliderApi<TProps>
> {}
```
