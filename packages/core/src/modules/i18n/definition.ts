import { defineModule } from '#src/helpers'

import { createI18n } from './createI18n'

/**
 * The i18n module. Register via `createVueform({ modules: { i18n } })`.
 */
export const i18n = defineModule({
  create: ({ vueform }) => createI18n(vueform),
})
