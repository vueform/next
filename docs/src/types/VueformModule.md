```ts
/**
 * An optional Vueform capability registered via `createVueform({ modules })`.
 * Unregistered modules are tree-shaken (only their inert noop surfaces stay);
 * runtime code that depends on them degrades or throws at the point of use.
 *
 * `T` is the module's contract — a custom implementation is any definition
 * whose `create` returns a compliant module.
 */
type VueformModule<T = unknown> = {
  /**
   * Creates the module. Called once per `createVueform()` at creation time (no
   * app involved); the result is stored on `vueform.modules` under the module's
   * key, while the definition itself stays in `config.modules`.
   *
   * @param context The creation context.
   */
  create: (context: ModuleCreateContext) => T

  /**
   * Optional app-side effects (e.g. style injection), called once when Vueform
   * is installed into a Vue app.
   *
   * @param context The app install context.
   */
  install?: (context: ModuleInstallContext) => void

  /**
   * Returns the CSS the module contributes (used by the theme module for SSR
   * style extraction).
   *
   * @param context The CSS collection context.
   */
  getCSS?: (context: ModuleCSSContext) => string
}
```
