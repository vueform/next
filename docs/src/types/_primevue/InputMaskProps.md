```ts
/**
 * Props for the input-mask element blueprint, parameterized by the
 * model-driving type arguments (`translate` / `languages`). Plain usage
 * (`InputMaskProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
interface InputMaskProps<
  T extends string = 'input-mask',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = InputMaskSlots,
  P = InputMaskParts,
  C = InputMaskClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      TranslateModelProp<TTranslate, TLanguages>,
      TContext
    >,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputMaskProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'id'
      | 'invalid'
      | 'fluid'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'class'
      | 'mask'
    > {
  /**
   * **This replaces the original PrimeVue `mask` prop.** Mask pattern for the
   * input. Supports dynamic text props.
   *
   * @replaces mask
   */
  mask?: TProp
}
```
