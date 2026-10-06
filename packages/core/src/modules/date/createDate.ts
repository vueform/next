import type { VueformInstance } from '#core/helpers'

import type { DateModule } from './types'

const MISSING_ADAPTER =
  '[Vueform error]: No `date` adapter is configured. Provide `$date.adapter` ' +
  '— `nativeDateAdapter` (from `@vueform/core`), or a date library adapter ' +
  '(`@vueform/date-dayjs`, `@vueform/date-fns`, `@vueform/date-luxon`).'

/**
 * Creates a date module from the given app config (uses `$date.adapter`).
 * `make` produces a new `DateInstance`, throwing when no adapter is
 * configured.
 *
 * @param config The app config (only `$date` is used).
 */
export function createDate(vueform: VueformInstance): DateModule {
  const { config } = vueform

  const options = config.$date ?? {}

  const make: DateModule['make'] = options.adapter
    ? options.adapter(options)
    : () => {
        throw new Error(MISSING_ADAPTER)
      }

  return { make }
}
