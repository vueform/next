import type { VueformInstance } from './createVueform'
import type { VueformInstanceModules } from './defineConfig'
// Private: imported by deep path from module doorways, never re-exported from
// the helpers barrel.
import { resolveVueform } from './resolveVueform'

/**
 * Resolves the modules of the instance a call should read from.
 *
 * @private
 * @param vueform Explicit instance, when the caller passed one.
 */
export function resolveModules(
  vueform?: VueformInstance
): VueformInstanceModules {
  return resolveVueform(vueform).modules
}
