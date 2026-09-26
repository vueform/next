import { createExpression } from './createExpression'
import { defineModule } from '#core/helpers'

/**
 * The expression module. Register via `createVueform({ modules: { expression }
 * })`.
 */
export const expression = defineModule({
  create: ({ vueform }) => createExpression(vueform),
})
