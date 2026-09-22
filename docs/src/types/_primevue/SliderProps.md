```ts
/**
 * Props for the slider element blueprint, parameterized by the model-driving
 * type argument (`range`). Plain usage (`SliderProps`) keeps every member wide,
 * so no separate plain-props alias is needed.
 *
 * - `range: false` — model is a scalar
 * - `range: true` — model is an array of two boundary values
 */
interface SliderProps<
  T extends string = 'slider',
  TRange extends boolean = boolean,
  S = SliderSlots,
  P = SliderParts,
  C = SliderClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<SliderModelProp<TRange>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    InfoProps,
    IntervalProps,
    /* @vue-ignore */ Omit<
      ASliderProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'min'
      | 'max'
      | 'step'
      | 'range'
    > {
  /**
   * When specified, allows two boundary values to be picked. Includes a naked
   * `boolean` arm alongside `TRange` so the erased schema surface still accepts
   * `range: true`. Literals continue to infer into `TRange`.
   */
  range?: TRange | boolean
}
```
