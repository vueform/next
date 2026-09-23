import type { VueformInstance } from './createVueform'
import type { App } from 'vue'

/**
 * The context passed to a module's `create` hook when `createVueform()` creates
 * the registered module definitions' modules.
 */
export type ModuleCreateContext = {
  /**
   * The Vueform instance the module belongs to. Its resolved configuration is
   * `vueform.config` — the module's own options live under its `$key` (e.g.
   * `vueform.config.$http`). Modules that depend on other modules resolve them
   * through it lazily, at call time (`getLocaleModule(vueform)`) — never at
   * creation, so creation order is irrelevant.
   */
  vueform: VueformInstance
}

/**
 * The context passed to a module's `install` hook when Vueform is installed
 * into a Vue app.
 */
export type ModuleInstallContext = {
  /**
   * The Vue application instance Vueform is being installed into.
   */
  app: App

  /**
   * The Vueform instance being installed — its resolved configuration is
   * `vueform.config`.
   */
  vueform: VueformInstance
}

/**
 * The context passed to a module's `getCSS` hook when the instance collects its
 * CSS (`vueform.getCSS()` / `vueform.getStyleTag()`).
 */
export type ModuleCSSContext = {
  /**
   * The Vueform instance whose CSS is being collected — its resolved
   * configuration is `vueform.config`.
   */
  vueform: VueformInstance
}

/**
 * An optional Vueform capability registered via `createVueform({ modules })`.
 * Unregistered modules are tree-shaken (only their inert noop surfaces stay);
 * runtime code that depends on them degrades or throws at the point of use.
 *
 * `T` is the module's contract — a custom implementation is any definition
 * whose `create` returns a compliant module.
 */
export type VueformModule<T = unknown> = {
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

/**
 * Defines a Vueform module. A typed identity helper — it does not transform the
 * definition at runtime.
 *
 * @private
 * @param module The module definition.
 */
export function defineModule<T>(module: VueformModule<T>): VueformModule<T> {
  return module
}
