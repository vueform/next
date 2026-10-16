```ts
/**
 * Props for the field element blueprint, parameterized by the model-driving
 * type arguments (`translate` / `languages` / `nullValue`). Plain usage
 * (`FieldProps`) keeps every member wide, so no separate plain-props alias is
 * needed.
 *
 * `nullValue` always types one value: it is the model when the element is not
 * translatable, and each language's entry when `translate: true` (where the
 * model is a locale-keyed object of it).
 */
interface FieldProps<
  T extends string = 'field',
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
  S = FieldSlots,
  P = FieldParts,
  C = FieldClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefault<
      FieldTranslateModelProp<TTranslate, TLanguages, TNullValue>,
      TContext
    >,
    TValidationProps<TContext>,
    TranslateProps<TTranslate, TLanguages>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    ReadonlyProps<TContext> {
  /**
   * The custom null value representing an empty state. Always describes one
   * value: the model itself when the element is not translatable, and each
   * language's entry when `translate: true`.
   */
  nullValue?: TNullValue

  /**
   * Arbitrary pass-through options exposed in the slot context, useful for
   * parameterizing slot components in schema-driven usage.
   */
  options?: Record<string, any>
}
```
