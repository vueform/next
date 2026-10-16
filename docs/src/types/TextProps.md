```ts
/**
 * Props for the text element blueprint, parameterized by the model-driving type
 * arguments (`translate` / `languages`). Plain usage (`TextProps`) keeps every
 * member wide, so no separate plain-props alias is needed.
 */
interface TextProps<
  T extends string = 'text',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = TextSlots,
  P = TextParts,
  C = TextClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<TranslateModelProp<TTranslate, TLanguages>, TContext>,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext> {
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
