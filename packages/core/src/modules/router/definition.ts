import { createRouter } from './createRouter'
import { defineModule } from '#core/helpers'

/**
 * The router module. Register via `createVueform({ modules: { router } })`.
 */
export const router = defineModule({
  create: ({ vueform }) => createRouter(vueform),
})
