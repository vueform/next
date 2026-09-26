```ts
/**
 * The modules of a Vueform instance (`vueform.modules`): created by
 * `createVueform()` from the definitions registered in `config.modules`. This
 * is what composables and doorways read (`vueform.modules.locale`); absent
 * modules are simply missing and consumers fall back to their inert noop
 * surfaces.
 */
interface VueformInstanceModules {
  autosave?: AutosaveModule
  http?: HttpModule
  date?: DateModule
  devtools?: DevtoolsModule
  locale?: LocaleModule
  security?: SecurityModule
  theme?: ThemeModule
  router?: RouterModule
  expression?: ExpressionModule
  conditions?: ConditionsModule
  validation?: ValidationModule

  /**
   * The model module is required — `createVueform()` throws without it, so the
   * instance always carries it.
   */
  model: ModelModule
}
```
