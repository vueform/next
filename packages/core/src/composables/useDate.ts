import type { VueformInstance } from '~/helpers'
import { getDateModule, type DateInstance } from '~/modules/date'

/**
 * Parses a value into a `DateInstance` using the configured date adapter
 * (`config.$date.adapter`). Returns the current date when called without
 * arguments.
 *
 * Setup-only when called without `vueform` — it resolves the calling
 * component's instance. Pass your `createVueform()` instance to use it anywhere
 * else, e.g. `useDate(value, format, vueform)`. Throws when the `date` module
 * is not registered.
 *
 * @param value The date value to parse (e.g. `Date`, ISO string, timestamp).
 * @param format Optional format string (requires a date format plugin).
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useDate(
  value?: any,
  format?: string,
  vueform?: VueformInstance
): DateInstance {
  return getDateModule(vueform).make(value, format)
}
