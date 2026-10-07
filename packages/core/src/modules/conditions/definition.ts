import { defineModule } from '#src/helpers'

import { createConditions } from './createConditions'

/**
 * The conditions module. Register via `createVueform({ modules: { conditions }
 * })`.
 */
export const conditions = defineModule({
  create: ({ vueform }) => createConditions(vueform),
})
