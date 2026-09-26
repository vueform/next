import { createSecurity } from './createSecurity'
import { defineModule } from '#core/helpers'

/**
 * The security module. Register via `createVueform({ modules: { security } })`.
 */
export const security = defineModule({
  create: ({ vueform }) => createSecurity(vueform),
})
