```ts
/**
 * Model / default prop type for translatable elements.
 *
 * Wrapped in `NoInfer` so `modelValue` / `default` / `v-model` do not compete
 * with the `translate` / `languages` / scalar-driving props when inferring the
 * generics (mirrors `ItemsModelProp`).
 */
type TranslateModelProp<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TScalar = string | number | null,
> = NoInfer<TranslateModel<TTranslate, TLanguages, TScalar>>
```
