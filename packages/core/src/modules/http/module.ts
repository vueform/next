import type { VueformInstance } from '~/helpers'
import { resolveModules } from '~/helpers/resolveModules'
import { noopHttp } from './noop'
import type { HttpModule } from './types'

/**
 * Returns the resolved instance's http module, or the inert `noopHttp` surface
 * (every request rejects with a descriptive error) when the `http` module is
 * not registered. Resolves the explicit `vueform` (a `createVueform()` instance
 * or config) when given, otherwise the config injected by the calling
 * component's app.
 */
export function getHttpModule(vueform?: VueformInstance): HttpModule {
  return resolveModules(vueform).http ?? noopHttp
}

/**
 * Whether an http module is registered — `false` means `getHttpModule` serves
 * the inert `noopHttp` surface, whose requests reject.
 */
export function hasHttpModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).http !== undefined
}
