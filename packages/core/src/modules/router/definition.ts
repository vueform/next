import { defineModule } from '@core/helpers'
import { createRouter } from './createRouter'

/**
 * The router module. Register via `createVueform({ modules: { router } })`.
 */
export const router = defineModule({
  create: ({ vueform }) => createRouter(vueform),
})
