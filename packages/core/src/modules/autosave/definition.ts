import { createAutosave } from './createAutosave'
import { defineModule } from '#core/helpers'

/**
 * The autosave module. Register via `createVueform({ modules: { autosave } })`.
 */
export const autosave = defineModule({
  create: ({ vueform }) => createAutosave(vueform),
})
