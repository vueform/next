// Private: imported by deep path from module doorways, never re-exported from
// the helpers barrel.
import type { VueformInstance } from '~/createVueform'
import { resolveVueform } from './resolveVueform'
import type { VueformInstanceModules } from './defineConfig'

/**
 * Resolves the modules of the instance a call should read from — the shared
 * first step of every module doorway (`getXModule(vueform?)` reads
 * `resolveModules(vueform).x ?? noopX`). See `resolveVueform` for the
 * resolution order and failure mode.
 *
 * @private
 * @param vueform Explicit instance, when the caller passed one.
 */
export function resolveModules(
  vueform?: VueformInstance
): VueformInstanceModules {
  return resolveVueform(vueform).modules
}
