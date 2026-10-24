```ts
/**
 * The modules of a Vueform instance (`vueform.modules`), created by
 * `createVueform()` from the definitions registered in `config.modules`.
 */
interface VueformInstanceModules {
  autosave?: AutosaveModule
  http?: HttpModule
  date?: DateModule
  devtools?: DevtoolsModule
  i18n?: I18nModule
  security?: SecurityModule
  theme?: ThemeModule
  router?: RouterModule
  expression?: ExpressionModule
  conditions?: ConditionsModule
  validation?: ValidationModule

  /**
   * The model module — required, so the instance always carries it.
   */
  model: ModelModule
}
```
