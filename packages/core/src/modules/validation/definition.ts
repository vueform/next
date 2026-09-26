import { createValidation } from './createValidation'
import { defineModule } from '#core/helpers'

/**
 * The validation module. Register via `createVueform({ modules: { validation }
 * })`.
 */
export const validation = defineModule({
  create: ({ vueform }) => createValidation(vueform),
})
