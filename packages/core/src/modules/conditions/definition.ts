import { defineModule } from '#core/helpers'

import { createConditions } from './createConditions'

/**
 * The conditions module. Register via `createVueform({ modules: { conditions }
 * })`.
 */
export const conditions = defineModule({
  create: ({ vueform }) => createConditions(vueform),
})
