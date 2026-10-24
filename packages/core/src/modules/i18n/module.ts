import type { VueformInstance } from '#src/helpers'
import { resolveModules } from '#src/helpers/resolveModules'

import { noopI18n } from './noop'
import type { I18nModule } from './types'

/**
 * Returns the resolved instance's i18n module, or the inert `noopI18n`
 * surface (translation tags resolve to their raw tag string, locale maps fall
 * back to their first entry) when the `i18n` module is not registered.
 * Resolves the explicit `vueform` (a `createVueform()` instance or config) when
 * given, otherwise the config injected by the calling component's app.
 */
export function getI18nModule(vueform?: VueformInstance): I18nModule {
  return resolveModules(vueform).i18n ?? noopI18n
}

/**
 * Whether an i18n module is registered — `false` means `getI18nModule`
 * serves the inert `noopI18n` surface.
 */
export function hasI18nModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).i18n !== undefined
}
