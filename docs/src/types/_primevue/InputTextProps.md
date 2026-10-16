```ts
/**
 * Props for the input-text element blueprint, parameterized by the
 * model-driving type arguments (`translate` / `languages`). Plain usage
 * (`InputTextProps`) keeps every member wide, so no separate plain-props alias
 * is needed.
 */
interface InputTextProps<
  T extends string = 'input-text',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = InputTextSlots,
  P = InputTextParts,
  C = InputTextClasses,
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
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TooltipProps,
    /* @vue-ignore */ Omit<
      AInputTextProps,
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'id'
      | 'type'
      | 'disabled'
      | 'placeholder'
      | 'readonly'
      | 'translate'
      | 'inputType'
      | 'autocomplete'
      | 'loading'
    > {
  /**
   * The HTML input type (e.g. text, email, password).
   */
  inputType?: InputTypeProp

  /**
   * The HTML `autocomplete` attribute value for the input.
   */
  autocomplete?: string
}
```
