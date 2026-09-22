import { computed } from 'vue'
import { warn, isProd } from '~/utils'
import type { LocaleModule } from './types'

let warnedSetLocale = false

/**
 * Warns once (dev only) when a locale switch is attempted without the module —
 * a call that shows clear intent the inert surface can't honor.
 */
function warnSetLocale() {
  if (warnedSetLocale || isProd()) return

  warnedSetLocale = true

  warn(
    'Switching the locale requires the `locale` module; register it via `createVueform({ modules: { locale } })`.'
  )
}

/**
 * Resolves a localizable value without locale awareness: strings pass through,
 * locale-keyed objects fall back to their first entry — the last step of the
 * regular resolution chain.
 */
function localize(msg?: string | Record<string, string>): string {
  if (!msg) return ''
  if (typeof msg === 'string') return msg

  return msg[Object.keys(msg)[0] || ''] || ''
}

/**
 * The inert locale surface used when the `locale` module is not registered —
 * behaves as if localization weren't there: translation tags resolve to their
 * raw tag string, locale maps fall back to their first entry, and locale
 * switching warns in dev.
 */
export const noopLocale: LocaleModule = {
  locale: computed({
    get: () => '',
    set: warnSetLocale,
  }),
  tags: {},
  locales: {},
  fallbackLocale: '',
  t: (tag) => (typeof tag === 'string' ? tag : ''),
  replaceParams: (msg) => msg,
  setLocale: warnSetLocale,
  set: warnSetLocale,
  localize,
  localizeObject: (obj) =>
    Object.entries(obj).reduce<Record<string, string>>(
      (localized, [value, label]) => ({
        ...localized,
        [value]: localize(label),
      }),
      {}
    ),
}
