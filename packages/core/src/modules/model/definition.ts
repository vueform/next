import { defineModule } from '#src/helpers'

import { createModel } from './instance'

/**
 * The model module. Register via `createVueform({ modules: { model } })`.
 */
export const model = defineModule({
  create: ({ vueform }) => createModel(vueform),
})
