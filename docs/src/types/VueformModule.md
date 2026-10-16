```ts
/**
 * An optional Vueform capability registered via `createVueform({ modules })`.
 */
type VueformModule<T = unknown> = {
  /**
   * Creates the module. Called once per `createVueform()`; the result is stored
   * on `vueform.modules` under the module's key.
   *
   * @param context The creation context.
   */
  create: (context: ModuleCreateContext) => T

  /**
   * Optional app-side effects, called once when Vueform is installed into a Vue
   * app.
   *
   * @param context The app install context.
   */
  install?: (context: ModuleInstallContext) => void

  /**
   * Returns the CSS the module contributes.
   *
   * @param context The CSS collection context.
   */
  getCSS?: (context: ModuleCSSContext) => string
}
```
