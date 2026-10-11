import type { VueformInstance } from '#src/helpers'
import { resolveModules } from '#src/helpers/resolveModules'

import { noopConditions } from './noop'
import type { ConditionsModule } from './types'

/**
 * Returns the resolved instance's conditions module, or the inert
 * `noopConditions` surface (every conditional resolves as met) when the
 * `conditions` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
export function getConditionsModule(
  vueform?: VueformInstance
): ConditionsModule {
  return resolveModules(vueform).conditions ?? noopConditions
}

/**
 * Whether a conditions module is registered — `false` means
 * `getConditionsModule` serves the inert `noopConditions` surface.
 */
export function hasConditionsModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).conditions !== undefined
}
