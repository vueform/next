import type { VueformInstance } from '#src/helpers'
import { resolveModules } from '#src/helpers/resolveModules'

import { noopValidation } from './noop'
import type { ValidationModule } from './types'

/**
 * Returns the resolved instance's validation module, or the inert
 * `noopValidation` surface (everything valid) when the `validation` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
export function getValidationModule(
  vueform?: VueformInstance
): ValidationModule {
  return resolveModules(vueform).validation ?? noopValidation
}

/**
 * Whether a validation module is registered — `false` means
 * `getValidationModule` serves the inert `noopValidation` surface.
 */
export function hasValidationModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).validation !== undefined
}
