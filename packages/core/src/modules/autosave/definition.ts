import { defineModule } from '#core/helpers'

import { createAutosave } from './createAutosave'

/**
 * The autosave module. Register via `createVueform({ modules: { autosave } })`.
 */
export const autosave = defineModule({
  create: ({ vueform }) => createAutosave(vueform),
})
