import { defineModule } from '~/helpers'
import { createLocale } from './createLocale'

/**
 * The locale module. Register via `createVueform({ modules: { locale } })`.
 */
export const locale = defineModule({
  create: ({ vueform }) => createLocale(vueform),
})
