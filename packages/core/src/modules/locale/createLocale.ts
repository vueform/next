import { computed, isRef, unref } from 'vue'
import type { VueformInstance } from '#core/helpers'
import type { en_US } from '#core/locales'
import type { LocaleModule, LocaleModuleOptions } from './types'
import { typedEntries } from '#core/utils'

export type LocaleTag = keyof typeof en_US | (string & {})

/**
 * Creates a locale instance from the given app config (uses the top-level
 * `locales`, `fallbackLocale`, `locale`, and `localeParamPattern` keys, with
 * `$locale` overrides applied on top).
 *
 * @param config The app config.
 */
export function createLocale(vueform: VueformInstance): LocaleModule {
  const { config } = vueform

  const options: LocaleModuleOptions = {
    locales: config.locales,
    fallbackLocale: config.fallbackLocale,
    locale: config.locale,
    localeParamPattern: config.localeParamPattern,
    ...config.$locale,
  }

  if (options.adapter) {
    return options.adapter(options)
  }

  let currentLocale = options.locale
  const locales = options.locales ?? {}
  const fallbackLocale = options.fallbackLocale ?? ''
  const localeParamPattern = options.localeParamPattern ?? /\{(\w+)\}/g

  const locale = computed({
    get: () => unref(currentLocale) || Object.keys(locales)[0],
    set: (v) =>
      isRef(currentLocale) ? (currentLocale.value = v) : (currentLocale = v),
  })

  // Exposed through a getter on the instance so `locale.tags[x]` stays a plain
  // property read (same surface as before) while reads still track the
  // computed — no @vueuse dependency needed for that.
  const tags = computed(() => ({
    ...locales[fallbackLocale],
    ...locales[locale.value],
  }))

  const t = (tag: LocaleTag, params?: Record<string, string | number>) => {
    if (typeof tag !== 'string') return ''
    const msg =
      locales[locale.value]?.[tag] ||
      locales[fallbackLocale || '']?.[tag] ||
      tag
    if (typeof msg === 'function') return ''
    if (!params) return msg
    return replaceParams(msg, params)
  }

  const setLocale = (v: string) => {
    locale.value = v
  }

  const localize = (msg?: string | Record<string, string>) => {
    if (!msg) return ''
    if (typeof msg === 'string') return msg as string
    return (
      msg[locale.value] ||
      msg[fallbackLocale || ''] ||
      msg[Object.keys(msg)[0] || ''] ||
      ''
    )
  }

  const localizeObject = (
    obj: Record<string, string | Record<string, string>>
  ) => {
    return typedEntries(obj).reduce(
      (localized, [value, label]) => ({
        ...localized,
        [value]: localize(label),
      }),
      {} as Record<string, string>
    )
  }

  const replaceParams = (
    msg: string,
    params?: Record<string, string | number>
  ) => {
    if (!params) return msg
    return (
      msg.replace(new RegExp(localeParamPattern.source, 'g'), (match, name) =>
        name in params ? String(params[name]) : match
      ) || msg
    )
  }

  const set = setLocale

  return {
    locale,
    get tags() {
      return tags.value
    },
    locales,
    fallbackLocale,
    t,
    set,
    setLocale,
    replaceParams,
    localize,
    localizeObject,
  }
}
