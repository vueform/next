import type { VueformInstance } from '#core/helpers'
import type { DateModule } from './types'
import { resolveModules } from '#core/helpers/resolveModules'

/**
 * Returns the resolved instance's date module. Throws when the module is not
 * registered. Resolves the explicit `vueform` (a `createVueform()` instance or
 * config) when given, otherwise the config injected by the calling component's
 * app.
 */
export function getDateModule(vueform?: VueformInstance): DateModule {
  const date = resolveModules(vueform).date

  if (!date) {
    throw new Error(
      'The `date` module is not registered. Register it via ' +
        '`createVueform({ modules: { date } })`'
    )
  }

  return date
}

/**
 * Whether a date module is registered — `false` means `getDateModule` throws.
 */
export function hasDateModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).date !== undefined
}
