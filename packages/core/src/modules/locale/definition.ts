import { createLocale } from './createLocale'
import { defineModule } from '#core/helpers'

/**
 * The locale module. Register via `createVueform({ modules: { locale } })`.
 */
export const locale = defineModule({
  create: ({ vueform }) => createLocale(vueform),
})
