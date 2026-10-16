import { useVueformContext } from '#src/contexts'

/**
 * Returns the resolved Vueform configuration of the calling component's app.
 * Setup-only — throws `NotInstalledError` outside a component context.
 *
 * @private
 */
export function useConfig() {
  return useVueformContext().config
}
