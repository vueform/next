import { useVueformContext } from '#src/contexts'
import type { VueformInstance } from '#src/helpers'

/**
 * Returns the Vueform instance of the calling component's app — its `config`
 * and created `modules`. Setup-only — throws `NotInstalledError` outside a
 * component context; code with no component holds its `createVueform()`
 * instance already.
 *
 * @private
 */
export function useVueform(): VueformInstance {
  return useVueformContext()
}
