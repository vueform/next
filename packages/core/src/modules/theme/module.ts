import type { VueformInstance } from '#src/helpers'
import { resolveModules } from '#src/helpers/resolveModules'

import { noopTheme } from './noop'
import type { ThemeModule } from './types'

/**
 * Returns the resolved instance's theme module, or the inert `noopTheme`
 * surface (token styles resolve to an empty object) when the `theme` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
export function getThemeModule(vueform?: VueformInstance): ThemeModule {
  return resolveModules(vueform).theme ?? noopTheme
}

/**
 * Whether a theme module is registered — `false` means `getThemeModule` serves
 * the inert `noopTheme` surface.
 */
export function hasThemeModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).theme !== undefined
}
