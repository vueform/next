import { defineModule } from '@core/helpers'
import { createExpression } from './createExpression'

/**
 * The expression module. Register via `createVueform({ modules: { expression }
 * })`.
 */
export const expression = defineModule({
  create: ({ vueform }) => createExpression(vueform),
})
