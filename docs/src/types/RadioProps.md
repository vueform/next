```ts
/**
 * Props for the radio element blueprint, parameterized by the model-driving
 * type argument (`radioValue`). Plain usage (`RadioProps`) keeps every member
 * wide, so no separate plain-props alias is needed.
 */
interface RadioProps<
  T extends string = 'radio',
  TRadioValue = any,
  S = RadioSlots,
  P = RadioParts,
  C = RadioClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<RadioModelProp<TRadioValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    AlignedProps {
  /**
   * The value submitted when this radio is selected. Also drives the model type
   * (as `radioValue | null`). May be an object or array when the radios list is
   * built from complex item values.
   *
   * Includes a naked `boolean` arm alongside `TRadioValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TRadioValue`.
   */
  radioValue?: TRadioValue | boolean

  /**
   * Overrides the HTML `name` attribute for the radio input.
   */
  radioName?: TProp<string, TContext>

  /**
   * The label text displayed alongside the radio button.
   */
  text?: TProp<string, TContext>

  /**
   * The alignment of the radio label relative to the radio button.
   */
  align?: 'left' | 'right' | 'auto'
}
```
