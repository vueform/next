```ts
/**
 * Props for the editor element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages`). Plain usage (`EditorProps`) keeps
 * every member wide, so no separate plain-props alias is needed.
 */
interface EditorProps<
  T extends string = 'editor',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  S = EditorSlots,
  P = EditorParts,
  C = EditorClasses,
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
    DisabledProps<TContext>,
    ReadonlyProps<TContext>,
    PlaceholderProps<TContext>,
    InfoProps,
    /* @vue-ignore */ Omit<
      AEditorProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'formControl'
      | 'placeholder'
      | 'readonly'
      | 'modules'
    >,
    Pick<AEditorProps, 'modules'> {
  /**
   * Height of the editor content area. Numbers are interpreted as pixels.
   */
  editorHeight?: string | number

  /**
   * Inline style of the container.
   */
  editorStyle?: any
}
```
