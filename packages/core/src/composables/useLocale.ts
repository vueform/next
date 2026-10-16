import type { VueformInstance } from '#src/helpers'
import { getLocaleModule, type LocaleModule } from '#src/modules/locale'

/**
 * Returns the locale module for translation and localization. Setup-only when
 * called without `vueform`.
 *
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useLocale(vueform?: VueformInstance): LocaleModule {
  return getLocaleModule(vueform)
}
