import { createModel } from './createModel'
import { defineModule } from '#core/helpers'

/**
 * The model module. Register via `createVueform({ modules: { model } })`.
 */
export const model = defineModule({
  create: ({ vueform }) => createModel(vueform),
})
