```ts
/**
 * Props for the input-number element blueprint.
 *
 * Non-generic counterpart — no model-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface InputNumberProps<
  T extends string = 'input-number',
  S = InputNumberSlots,
  P = InputNumberParts,
  C = InputNumberClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<TextishModel, TContext>,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    IntervalProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputNumberProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'inputId'
      | 'min'
      | 'max'
      | 'step'
      | 'currency'
      | 'locale'
      | 'prefix'
      | 'suffix'
      | 'mode'
    > {
  /**
   * The currency to use in currency formatting. Accepts expressions.
   */
  currency?: DProp

  /**
   * Locale to be used in formatting. Accepts expressions.
   */
  locale?: DProp

  /**
   * Text to display before the value. Accepts expressions.
   */
  prefix?: DProp

  /**
   * Text to display after the value. Accepts expressions.
   */
  suffix?: DProp

  /**
   * Defines the behavior of the component.
   */
  mode?: any
}
```
