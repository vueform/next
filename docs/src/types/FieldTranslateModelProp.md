```ts
/**
 * Model / default prop type for field — `NoInfer` so `modelValue` does not
 * compete with `translate` / `languages` / `nullValue` when inferring
 * generics.
 */
type FieldTranslateModelProp<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> = NoInfer<FieldTranslateModel<TTranslate, TLanguages, TNullValue>>
```
