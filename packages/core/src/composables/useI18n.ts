import type { VueformInstance } from '#src/helpers'
import { getI18nModule, type I18nModule } from '#src/modules/i18n'

/**
 * Returns the i18n module for translation and localization. Setup-only when
 * called without `vueform`.
 *
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useI18n(vueform?: VueformInstance): I18nModule {
  return getI18nModule(vueform)
}
