import { defineModule } from '~/helpers'
import { createDate } from './createDate'

/**
 * The date module. Register via `createVueform({ modules: { date } })`.
 */
export const date = defineModule({
  create: ({ vueform }) => createDate(vueform),
})
