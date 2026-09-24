import type { VueformInstance } from '@core/helpers'
import { resolveModules } from '@core/helpers/resolveModules'
import { noopExpression } from './noop'
import type { ExpressionModule } from './types'

/**
 * Returns the resolved instance's expression module, or the inert
 * `noopExpression` surface (`installed: false`, passthrough `resolve`) when the
 * `expression` module is not registered. Resolves the explicit `vueform` (a
 * `createVueform()` instance or config) when given, otherwise the config
 * injected by the calling component's app.
 */
export function getExpressionModule(
  vueform?: VueformInstance
): ExpressionModule {
  return resolveModules(vueform).expression ?? noopExpression
}

/**
 * Whether an expression module is registered — `false` means
 * `getExpressionModule` serves the inert `noopExpression` surface. Note this is
 * registration only: a registered module can still be inert (`installed:
 * false`) when `$expression.enabled` is `false`.
 */
export function hasExpressionModule(vueform?: VueformInstance): boolean {
  return resolveModules(vueform).expression !== undefined
}
