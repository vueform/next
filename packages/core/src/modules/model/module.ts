import type { VueformInstance } from '#core/helpers'
import type { ModelModule } from './types'
import { resolveModules } from '#core/helpers/resolveModules'

/**
 * Returns the resolved instance's model module. Throws when the module is not
 * registered. Resolves the explicit `vueform` (a `createVueform()` instance or
 * config) when given, otherwise the config injected by the calling component's
 * app.
 */
export function getModelModule(vueform?: VueformInstance): ModelModule {
  const model = resolveModules(vueform).model

  if (!model) {
    throw new Error(
      'The `model` module is not registered. Register it via ' +
        '`createVueform({ modules: { model } })`.'
    )
  }

  return model
}
