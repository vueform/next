```ts
/**
 * Props for the radio-button element blueprint, parameterized by the
 * model-driving type argument (`value`). Plain usage (`RadioButtonProps`) keeps
 * every member wide, so no separate plain-props alias is needed.
 */
interface RadioButtonProps<
  T extends string = 'radio-button',
  TRadioValue = any,
  S = RadioButtonSlots,
  P = RadioButtonParts,
  C = RadioButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<RadioButtonModelProp<TRadioValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      ARadioButtonProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'binary'
      | 'value'
    > {
  /**
   * Overrides the HTML `name` attribute for the radio input.
   */
  radioName?: TProp<string, TContext>

  /**
   * The label text displayed next to the radio button.
   */
  text?: TProp<string, TContext>

  /**
   * Positions the label text relative to the radio button (`left`, `right`, or
   * `auto`).
   */
  align?: 'left' | 'right' | 'auto'

  /**
   * The value submitted when this radio is selected. Also drives the model type
   * (as `value | null`). May be an object or array when the radios list is
   * built from complex item values.
   *
   * Includes a naked `boolean` arm alongside `TRadioValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TRadioValue`.
   */
  value?: TRadioValue | boolean
}
```
