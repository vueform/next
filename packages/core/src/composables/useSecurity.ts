import type { VueformInstance } from '#src/helpers'
import { getSecurityModule, type SecurityModule } from '#src/modules/security'

/**
 * Returns the security module (sanitizer, gates, and `encrypt` / `decrypt`
 * ciphers). Setup-only when called without an instance; with an explicit
 * `vueform` it resolves that instance's module and works anywhere.
 *
 * @param vueform The owning instance; omit to resolve the calling component's.
 */
export function useSecurity(vueform?: VueformInstance): SecurityModule {
  return getSecurityModule(vueform)
}
