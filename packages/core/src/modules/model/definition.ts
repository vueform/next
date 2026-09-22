import { defineModule } from '~/helpers'
import { createModel } from './createModel'

/**
 * The model module. Register via `createVueform({ modules: { model } })`.
 */
export const model = defineModule({
  create: ({ vueform }) => createModel(vueform),
})
