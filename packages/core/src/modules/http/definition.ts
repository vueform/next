import { createHttp } from './createHttp'
import { defineModule } from '#core/helpers'

/**
 * The http module. Register via `createVueform({ modules: { http } })`.
 */
export const http = defineModule({
  create: ({ vueform }) => createHttp(vueform),
})
