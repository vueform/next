import { useVueformContext } from '#src/contexts'
import type { VueformInstance } from '#src/helpers'

/**
 * Returns the Vueform instance of the injecting app (component setup /
 * `app.runWithContext`). Throws `NotInstalledError` outside a component context
 * — there is deliberately no ambient fallback, so a call can never silently
 * read another instance's (or, under SSR, another request's) modules.
 */
export function useVueform(): VueformInstance {
  return useVueformContext()
}
