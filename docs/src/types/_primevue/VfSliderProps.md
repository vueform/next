```ts
/**
 * Generic props interface for the VfSlider component, parameterized by the
 * model-driving type argument (e.g. `VfSliderProps<true>`). Reach for
 * `VfSliderProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfSliderProps<TRange extends boolean = boolean> extends SliderProps<
  'slider',
  TRange,
  VfSliderSlots<TRange>,
  VfSliderParts,
  VfSliderClasses,
  VfSliderContext<VfSliderProps<TRange>>
> {}
```
