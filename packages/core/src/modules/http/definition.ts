import { defineModule } from '#core/helpers'

import { createHttp } from './createHttp'

/**
 * The http module. Register via `createVueform({ modules: { http } })`.
 */
export const http = defineModule({
  create: ({ vueform }) => createHttp(vueform),
})
