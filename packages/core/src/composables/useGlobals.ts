import { useVueformContext } from '@core/contexts'

/**
 * Returns the globals of the calling component's Vueform instance.
 *
 * @private
 */
export function useGlobals() {
  return useVueformContext().globals
}
