import { type MaybeRef, type WritableComputedRef } from 'vue'
import type { LocalesProp } from '#core/types'
import type { LocaleTag } from './createLocale'

/**
 * The locale module instance providing translation, localization, and locale
 * switching.
 */
export interface LocaleModule {
  /**
   * The currently active locale key (readable and writable).
   */
  locale: WritableComputedRef<string, string>

  /**
   * Merged translation tags from the active locale and the fallback locale.
   */
  tags: {
    [x: string]: string | (() => string)
  }

  /**
   * The registered locale definitions keyed by locale name.
   */
  locales: LocalesProp

  /**
   * The fallback locale key used when a translation is missing from the active
   * locale.
   */
  fallbackLocale: string | (string & {})

  /**
   * Translates a locale tag key, substituting optional parameters.
   *
   * @param tag The translation tag key.
   * @param params Optional parameter values to interpolate.
   */
  t: (tag: LocaleTag, params?: Record<string, string | number>) => string

  /**
   * Replaces parameter placeholders in a message string with the corresponding
   * parameter values. Placeholders are identified by the `localeParamPattern`
   * config option (defaults to `{param}`).
   *
   * @param msg The message template containing placeholders.
   * @param params Key-value pairs to substitute.
   */
  replaceParams: (
    msg: string,
    params?: Record<string, string | number>
  ) => string

  /**
   * Sets the active locale by key.
   *
   * @param locale The locale key to switch to.
   */
  setLocale: (locale: string) => void

  /**
   * Sets the active locale by key.
   *
   * @param locale The locale key to switch to.
   */
  set: (locale: string) => void

  /**
   * Resolves a localizable value — returns the string for the active locale
   * when given a locale-keyed object, or the string itself when given a plain
   * string.
   *
   * @param msg A plain string or a `{ locale: translation }` map.
   */
  localize: (msg?: string | Record<string, string>) => string

  /**
   * Localizes every value in a `{ value: label }` map, returning a flat
   * `Record<string, string>` with resolved labels.
   *
   * @param obj An object whose values are plain strings or locale-keyed maps.
   */
  localizeObject: (
    obj: Record<string, string | Record<string, string>>
  ) => Record<string, string>
}

/**
 * A factory that produces a `LocaleModule` instance.
 */
export type LocaleAdapter = (options: LocaleModuleOptions) => LocaleModule

/**
 * Configuration options for the locale module (`config.$locale`).
 */
export interface LocaleModuleOptions {
  /**
   * Registered locale definitions keyed by locale name.
   */
  locales?: LocalesProp

  /**
   * Fallback locale key used when a translation is missing.
   */
  fallbackLocale?: string

  /**
   * Active locale key (or a ref to one).
   */
  locale?: MaybeRef<string>

  /**
   * Pattern used to interpolate `{param}` placeholders in messages.
   */
  localeParamPattern?: RegExp

  /**
   * Custom locale implementation replacing the built-in translator.
   */
  adapter?: LocaleAdapter
}
