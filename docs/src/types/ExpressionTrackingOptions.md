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
   * Resolves the host-level kill-switch (the form's `noExpressions` prop).
   * When it reports `true`, no node tracks — a form's `noExpressions` cannot
   * be overridden by its elements.
   */
  noExpressions?: () => boolean | undefined
}
```
