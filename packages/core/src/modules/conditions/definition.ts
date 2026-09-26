import { createConditions } from './createConditions'
import { defineModule } from '#core/helpers'

/**
 * The conditions module. Register via `createVueform({ modules: { conditions }
 * })`.
 */
export const conditions = defineModule({
  create: ({ vueform }) => createConditions(vueform),
})
