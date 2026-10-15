import type { App } from 'vue'

/**
 * Global options for the devtools module (the `$devtools` config object).
 */
export interface DevtoolsModuleOptions {}

/**
 * The devtools module: registers a Vueform custom inspector with Vue DevTools
 * and tracks mounted forms in it. Development-only by design — in production
 * builds, and when the top-level `devtools` config option is `false`, the
 * module's surface is inert. Core only defines the contract and the inert
 * `noopDevtools` surface; the implementation ships in `@vueform/devtools`.
 */
export interface DevtoolsModule {
  /**
   * Registers a form context for DevTools tracking.
   *
   * @param uid The form's unique identifier.
   * @param context The form's component context.
   */
  registerForm: (uid: string, context: any) => void

  /**
   * Unregisters a form context from DevTools tracking.
   *
   * @param uid The form's unique identifier.
   */
  unregisterForm: (uid: string) => void

  /**
   * Signals DevTools to re-query the inspector tree and state panel.
   */
  refreshInspector: () => void

  /**
   * Initializes the Vue DevTools plugin with the Vueform custom inspector for
   * the given app (once per app). Called automatically when Vueform is
   * installed.
   *
   * @param app The Vue application instance.
   */
  setupInspector: (app: App) => void
}
