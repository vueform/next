// Leaf module: reached (via `#core/helpers/resolveVueform`) from every module
// doorway, so it must never import `#core/contexts` or `#core/composables` — that
// would close the cycle modules → contexts → composables → modules.
import type { VueformInstance } from '#core/helpers'
import type { App } from 'vue'
import { createContext } from '#core/helpers/createContext'
import { NotInstalledError } from '#core/utils/errors'

/**
 * The instance context: provided app-wide at install, injected by the calling
 * component's app.
 */
const [injectVueform, provideVueform] =
  createContext<VueformInstance>('vueform')

/**
 * Provides the Vueform instance to all descendant components via the Vue app.
 *
 * @param vueform The Vueform instance.
 * @param app The Vue application instance.
 */
export function createVueformContext(
  vueform: VueformInstance,
  app: App
): VueformInstance {
  provideVueform(vueform, app)
  return vueform
}

/**
 * Returns the Vueform instance of the injecting app (component setup /
 * `app.runWithContext`). Throws `NotInstalledError` outside a component context
 * — there is deliberately no ambient fallback, so a call can never silently
 * read another instance's (or, under SSR, another request's) modules.
 *
 * @context
 */
export function useVueformContext(): VueformInstance {
  const vueform = injectVueform()

  if (!vueform) {
    throw new NotInstalledError()
  }

  return vueform
}
