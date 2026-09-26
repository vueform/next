import { createDate } from './createDate'
import { defineModule } from '#core/helpers'

/**
 * The date module. Register via `createVueform({ modules: { date } })`.
 */
export const date = defineModule({
  create: ({ vueform }) => createDate(vueform),
})
