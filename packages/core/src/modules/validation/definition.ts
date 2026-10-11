import { defineModule } from '#src/helpers'

import { createValidation } from './createValidation'

/**
 * The validation module. Register via `createVueform({ modules: { validation }
 * })`.
 */
export const validation = defineModule({
  create: ({ vueform }) => createValidation(vueform),
})
