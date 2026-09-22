```ts
/**
 * Generic props interface for the VfSlider component, parameterized by the
 * model-driving type argument (e.g. `VfSliderProps<true>`). Reach for
 * `VfSliderProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/vite/build` (see the `#shorthands` marker import on
 * `unstyled.ts`).
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
