import type { VueformInstance } from '#core/helpers'
import { resolveModules } from '#core/helpers/resolveModules'

import { noopDevtools } from './noop'
import type { DevtoolsModule } from './types'

/**
 * Returns the resolved instance's devtools module, or the inert `noopDevtools`
 * surface (nothing is tracked, every method no-ops) when the `devtools` module
 * is not registered. Resolves the explicit `vueform` (a `createVueform()`
 * instance or config) when given, otherwise the config injected by the calling
 * component's app.
 */
export function getDevtoolsModule(vueform?: VueformInstance): DevtoolsModule {
  return resolveModules(vueform).devtools ?? noopDevtools
}

/**
 * Whether a devtools module is registered — `false` means `getDevtoolsModule`
 * serves the inert `noopDevtools` surface. Note that a registered module is
 * itself inert in production and with `devtools: false` in the config.
 */
export function hasDevtoolsModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).devtools !== undefined
}
