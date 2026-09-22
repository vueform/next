// Private: imported by deep path from `resolveModules`, the security doorway,
// and `useForm`; never re-exported from the helpers barrel.
import { useVueformContext } from '~/contexts/vueform'
import type { VueformInstance } from '~/createVueform'

/**
 * Resolves the Vueform instance a call should read from: the explicit instance
 * when given, otherwise the instance injected by the calling component's app.
 * There is no ambient fallback — outside a component context, callers hold
 * their `createVueform()` instance and use it directly. Throws
 * `NotInstalledError` when neither is available.
 *
 * @private
 * @param vueform Explicit instance, when the caller passed one.
 */
export function resolveVueform(vueform?: VueformInstance): VueformInstance {
  return vueform ?? useVueformContext()
}
