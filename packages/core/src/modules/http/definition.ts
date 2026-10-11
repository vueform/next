import { defineModule } from '#src/helpers'

import { createHttp } from './createHttp'

/**
 * The http module. Register via `createVueform({ modules: { http } })`.
 */
export const http = defineModule({
  create: ({ vueform }) => createHttp(vueform),
})
