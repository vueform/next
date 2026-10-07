import { defineModule } from '#src/helpers'

import { createSecurity } from './createSecurity'

/**
 * The security module. Register via `createVueform({ modules: { security } })`.
 */
export const security = defineModule({
  create: ({ vueform }) => createSecurity(vueform),
})
