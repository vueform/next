```ts
/**
 * The registered Vueform module implementations.
 */
interface VueformModules {
  /**
   * The autosave module for remote interval/event form saving and drafts.
   */
  autosave?: VueformModule<AutosaveModule>

  /**
   * The HTTP module for network requests.
   */
  http?: VueformModule<HttpModule>

  /**
   * The date module for date manipulation and comparison.
   */
  date?: VueformModule<DateModule>

  /**
   * The devtools module for Vue DevTools form inspection (development-only).
   */
  devtools?: VueformModule<DevtoolsModule>

  /**
   * The i18n module for translation and localization.
   */
  i18n?: VueformModule<I18nModule>

  /**
   * The security module for HTML sanitization.
   */
  security?: VueformModule<SecurityModule>

  /**
   * The theme module for CSS variable generation, dark-mode detection, and
   * style injection.
   */
  theme?: VueformModule<ThemeModule>

  /**
   * The router module for browser history integration in multi-step forms.
   */
  router?: VueformModule<RouterModule>

  /**
   * The expression module for resolving dynamic string expressions.
   */
  expression?: VueformModule<ExpressionModule>

  /**
   * The conditions module for evaluating element visibility.
   */
  conditions?: VueformModule<ConditionsModule>

  /**
   * The validation module for creating and running element validators.
   */
  validation?: VueformModule<ValidationModule>

  /**
   * The model module for form data store integration.
   */
  model?: VueformModule<ModelModule>
}
```
