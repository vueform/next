import { noopLocale } from './noop'
import type { VueformInstance } from '#core/helpers'
import type { LocaleModule } from './types'
import { resolveModules } from '#core/helpers/resolveModules'

/**
 * Returns the resolved instance's locale module, or the inert `noopLocale`
 * surface (translation tags resolve to their raw tag string, locale maps fall
 * back to their first entry) when the `locale` module is not registered.
 * Resolves the explicit `vueform` (a `createVueform()` instance or config) when
 * given, otherwise the config injected by the calling component's app.
 */
export function getLocaleModule(vueform?: VueformInstance): LocaleModule {
  return resolveModules(vueform).locale ?? noopLocale
}

/**
 * Whether a locale module is registered — `false` means `getLocaleModule`
 * serves the inert `noopLocale` surface.
 */
export function hasLocaleModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).locale !== undefined
}
