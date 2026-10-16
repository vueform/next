import { useVueformContext } from '#src/contexts'
import type { VueformInstance } from '#src/helpers'

/**
 * Returns the Vueform instance of the calling component's app. Setup-only —
 * throws `NotInstalledError` outside a component context.
 *
 * @private
 */
export function useVueform(): VueformInstance {
  return useVueformContext()
}
