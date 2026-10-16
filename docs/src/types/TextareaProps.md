```ts
/**
 * Props for the textarea element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages`). Plain usage (`TextareaProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 */
interface TextareaProps<
  T extends string = 'textarea',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = TextareaSlots,
  P = TextareaParts,
  C = TextareaClasses,
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
    AriaProps,
    ReadonlyProps<TContext>,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext> {
  /**
   * The number of visible text rows for the textarea.
   */
  rows?: number

  /**
   * Whether the textarea automatically grows to fit its content. When true, the
   * height adjusts as lines are added or removed.
   */
  autogrow?: boolean

  /**
   * Whether the native browser resize handle is enabled on the textarea.
   */
  resize?: boolean
}
```
