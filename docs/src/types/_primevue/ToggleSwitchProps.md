```ts
/**
 * Props for the toggle-switch element blueprint, parameterized by the
 * model-driving type arguments (`trueValue` / `falseValue`). Plain usage
 * (`ToggleSwitchProps`) keeps every member wide, so no separate plain-props
 * alias is needed.
 */
interface ToggleSwitchProps<
  T extends string = 'toggle-switch',
  TTrueValue = any,
  TFalseValue = any,
  S = ToggleSwitchSlots,
  P = ToggleSwitchParts,
  C = ToggleSwitchClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      ToggleSwitchModelProp<TTrueValue, TFalseValue>,
      TContext
    >,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    InfoProps,
    AlignedProps,
    /* @vue-ignore */ Omit<
      AToggleSwitchProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'disabled'
      | 'readonly'
      | 'trueValue'
      | 'falseValue'
    > {
  /**
   * The value used when the switch is on. Also drives one arm of the model
   * type.
   *
   * Includes a naked `boolean` arm alongside `TTrueValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TTrueValue`.
   */
  trueValue?: TTrueValue | boolean

  /**
   * The value used when the switch is off. Also drives one arm of the model
   * type.
   *
   * Includes a naked `boolean` arm alongside `TFalseValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TFalseValue`.
   */
  falseValue?: TFalseValue | boolean

  /**
   * Icon displayed when the switch is in the on state.
   */
  onIcon?: DProp<string, TContext>

  /**
   * Icon displayed when the switch is in the off state.
   */
  offIcon?: DProp<string, TContext>
}
```
