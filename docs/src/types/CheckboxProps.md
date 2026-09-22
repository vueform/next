```ts
/**
 * Props for the checkbox element blueprint, parameterized by the model-driving
 * type arguments (`trueValue` / `falseValue`). Plain usage (`CheckboxProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 */
interface CheckboxProps<
  T extends string = 'checkbox',
  TTrueValue = any,
  TFalseValue = any,
  S = CheckboxSlots,
  P = CheckboxParts,
  C = CheckboxClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<CheckboxModelProp<TTrueValue, TFalseValue>, TContext>,
    ValidationProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    AlignedProps {
  /**
   * The value used when the checkbox is checked. Also drives one arm of the
   * model type.
   *
   * Includes a naked `boolean` arm alongside `TTrueValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TTrueValue`.
   */
  trueValue?: TTrueValue | boolean

  /**
   * The value used when the checkbox is unchecked. Also drives one arm of the
   * model type.
   *
   * Includes a naked `boolean` arm alongside `TFalseValue` so the erased schema
   * surface (and blueprint defaults) still accept `true` / `false` literals.
   * Concrete values continue to infer into `TFalseValue`.
   */
  falseValue?: TFalseValue | boolean

  /**
   * Overrides the HTML `name` attribute for the checkbox input.
   */
  checkboxName?: TProp<string, TContext>

  /**
   * The label text displayed next to the checkbox.
   */
  text?: TProp<string, TContext>

  /**
   * Positions the label text relative to the checkbox (`left`, `right`, or
   * `auto`).
   */
  align?: 'left' | 'right' | 'auto'
}
```
