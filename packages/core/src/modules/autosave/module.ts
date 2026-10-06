import type { VueformInstance } from '#core/helpers'
import { resolveModules } from '#core/helpers/resolveModules'

import { noopAutosave } from './noop'
import type { AutosaveModule } from './types'

/**
 * Returns the resolved instance's autosave module, or the inert `noopAutosave`
 * surface (the `autosave` prop has no effect, context methods no-op) when the
 * `autosave` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
export function getAutosaveModule(vueform?: VueformInstance): AutosaveModule {
  return resolveModules(vueform).autosave ?? noopAutosave
}

/**
 * Whether a autosave module is registered — `false` means `getAutosaveModule`
 * serves the inert `noopAutosave` surface.
 */
export function hasAutosaveModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).autosave !== undefined
}
