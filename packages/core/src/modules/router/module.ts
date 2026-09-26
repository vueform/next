import { noopRouter } from './noop'
import type { VueformInstance } from '#core/helpers'
import type { RouterModule } from './types'
import { resolveModules } from '#core/helpers/resolveModules'

/**
 * Returns the resolved instance's router module, or the inert `noopRouter`
 * surface (handlers record nothing and navigate nowhere, warning once in dev
 * when history tracking is actually requested) when the `router` module is not
 * registered. Resolves the explicit `vueform` (a `createVueform()` instance or
 * config) when given, otherwise the config injected by the calling component's
 * app.
 */
export function getRouterModule(vueform?: VueformInstance): RouterModule {
  return resolveModules(vueform).router ?? noopRouter
}

/**
 * Whether a router module is registered — `false` means `getRouterModule`
 * serves the inert `noopRouter` surface.
 */
export function hasRouterModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).router !== undefined
}
