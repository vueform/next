import type { VueformInstance } from '~/helpers'
import { resolveVueform } from '~/helpers/resolveVueform'
import { noopSecurity } from './noop'
import type { SecurityModule } from './types'

/**
 * Returns the resolved instance's security module, or the inert `noopSecurity`
 * surface (permissive unless `$security` intent is configured) when the
 * `security` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance) when given, otherwise the instance injected by
 * the calling component's app.
 */
export function getSecurityModule(vueform?: VueformInstance): SecurityModule {
  const instance = resolveVueform(vueform)
  return instance.modules.security ?? noopSecurity(instance.config)
}

/**
 * Whether a security module is registered — `false` means `getSecurityModule`
 * serves the inert `noopSecurity` surface.
 */
export function hasSecurityModule(vueform?: VueformInstance): boolean {
  return resolveVueform(vueform).modules.security !== undefined
}
