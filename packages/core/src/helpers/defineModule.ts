import type { App } from 'vue'

import type { VueformInstance } from './createVueform'

/**
 * The context passed to a module's `create` hook when `createVueform()` creates
 * the registered module definitions' modules.
 */
export type ModuleCreateContext = {
  /**
   * The Vueform instance the module belongs to.
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
   * The Vueform instance being installed.
   */
  vueform: VueformInstance
}

/**
 * The context passed to a module's `getCSS` hook when the instance collects its
 * CSS.
 */
export type ModuleCSSContext = {
  /**
   * The Vueform instance whose CSS is being collected.
   */
  vueform: VueformInstance
}

/**
 * An optional Vueform capability registered via `createVueform({ modules })`.
 */
export type VueformModule<T = unknown> = {
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

/**
 * Defines a Vueform module.
 *
 * @private
 * @param module The module definition.
 */
export function defineModule<T>(module: VueformModule<T>): VueformModule<T> {
  return module
}
