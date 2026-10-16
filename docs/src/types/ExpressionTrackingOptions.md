```ts
/**
 * Configuration for `makeExpressionTracking(index).activate()`.
 */
type ExpressionTrackingOptions = {
  /**
   * The model store resolved values are written through.
   */
  store: ModelStore

  /**
   * The (possibly partial) Vueform configuration.
   */
  config: VueformConfig

  /**
   * Resolves the languages used for translatable templates (one tracked
   * template per language). A getter so mounted hosts can hand over their
   * reactive `languages` without eager evaluation.
   */
  languages?: () => LanguagesProp | undefined

  /**
   * Resolves the constants merged under the model in expression resolution data
   * (instance-level `consts` headlessly, the form's resolved `consts` prop when
   * mounted). Callers omit names already registered in
   * `config.$expression.consts`.
   */
  consts?: () => Record<string, any> | undefined

  /**
   * Resolves the host-level expression allow-list (the form's `expressions`
   * prop), consulted between the node's own `expressions` prop and the config
   * trigger list.
   */
  expressions?: () => ExpressionsProp | undefined
}
```
