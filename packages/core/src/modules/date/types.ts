/**
 * Supported date unit identifiers (singular and plural forms).
 */
export type DateUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'
  | 'years'
  | 'months'
  | 'weeks'
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds'
  | 'milliseconds'

/**
 * /** A date wrapper providing a dayjs-compatible API for parsing,
 * manipulation, comparison, and formatting.
 */
export interface DateInstance {
  /**
   * Returns whether the underlying date is valid.
   */
  isValid(): boolean

  /**
   * Returns the full year (e.g. 2025).
   */
  year(): number

  /**
   * Returns the month (1–12).
   */
  month(): number

  /**
   * Returns the day of the month (1–31).
   */
  date(): number

  /**
   * Returns the day of the week (0 = Sunday … 6 = Saturday).
   */
  day(): number

  /**
   * Returns the hour (0–23).
   */
  hour(): number

  /**
   * Returns the minute (0–59).
   */
  minute(): number

  /**
   * Returns the second (0–59).
   */
  second(): number

  /**
   * Returns the millisecond (0–999).
   */
  millisecond(): number

  /**
   * Returns a new instance with the given amount added.
   *
   * @param amount The quantity to add.
   * @param unit The date unit to add.
   */
  add(amount: number, unit: DateUnit): DateInstance

  /**
   * Returns a new instance with the given amount subtracted.
   *
   * @param amount The quantity to subtract.
   * @param unit The date unit to subtract.
   */
  subtract(amount: number, unit: DateUnit): DateInstance

  /**
   * Returns a new instance set to the start of the given unit.
   *
   * @param unit The date unit whose start boundary to snap to.
   */
  startOf(unit: DateUnit): DateInstance

  /**
   * Returns a new instance set to the end of the given unit.
   *
   * @param unit The date unit whose end boundary to snap to.
   */
  endOf(unit: DateUnit): DateInstance

  /**
   * Returns a new instance with the specified unit set to a value.
   *
   * @param unit The date unit to set.
   * @param value The numeric value to assign.
   */
  set(unit: DateUnit, value: number): DateInstance

  /**
   * Returns whether this date is before the other date.
   *
   * @param other The date to compare against.
   * @param granularity Optional unit granularity for the comparison.
   */
  isBefore(other: DateInstance, granularity?: DateUnit): boolean

  /**
   * Returns whether this date is after the other date.
   *
   * @param other The date to compare against.
   * @param granularity Optional unit granularity for the comparison.
   */
  isAfter(other: DateInstance, granularity?: DateUnit): boolean

  /**
   * Returns whether this date is the same as the other date.
   *
   * @param other The date to compare against.
   * @param granularity Optional unit granularity for the comparison.
   */
  isSame(other: DateInstance, granularity?: DateUnit): boolean

  /**
   * Returns whether this date is the same as or before the other date.
   *
   * @param other The date to compare against.
   * @param granularity Optional unit granularity for the comparison.
   */
  isSameOrBefore(other: DateInstance, granularity?: DateUnit): boolean

  /**
   * Returns whether this date is the same as or after the other date.
   *
   * @param other The date to compare against.
   * @param granularity Optional unit granularity for the comparison.
   */
  isSameOrAfter(other: DateInstance, granularity?: DateUnit): boolean

  /**
   * Returns whether this date falls between two other dates.
   *
   * @param start The range start date.
   * @param end The range end date.
   * @param granularity Optional unit granularity for the comparison.
   * @param inclusivity Bracket notation controlling boundary inclusion.
   */
  isBetween(
    start: DateInstance,
    end: DateInstance,
    granularity?: DateUnit,
    inclusivity?: '()' | '[)' | '(]' | '[]'
  ): boolean

  /**
   * Returns the difference between this date and another in the given unit.
   *
   * @param other The date to diff against.
   * @param unit The unit for the result (milliseconds if omitted).
   */
  diff(other: DateInstance, unit?: DateUnit): number

  /**
   * Returns the underlying native `Date` object (cloned).
   */
  toDate(): Date

  /**
   * Returns the date as an ISO 8601 string with time and timezone.
   */
  toISOString(): string

  /**
   * Returns the date as an ISO 8601 date-only string (`YYYY-MM-DD`).
   */
  toISODate(): string

  /**
   * Returns the date as a Unix timestamp in milliseconds.
   */
  valueOf(): number

  /**
   * Returns the date as a Unix timestamp in seconds.
   */
  unix(): number

  /**
   * Returns a deep copy of this date instance.
   */
  clone(): DateInstance

  /**
   * Formats the date using the given format string. Requires a date format
   * plugin (`@vueform/date-dayjs`, `@vueform/date-fns`, or
   * `@vueform/date-luxon`).
   *
   * @param formatString The format pattern.
   */
  format(formatString: string): string
}

/**
 * The date module instance: a factory capturing the configured adapter. `make`
 * parses a value into a `DateInstance`. Per-call state lives in the returned
 * instance, not the module.
 */
export interface DateModule {
  /**
   * Parses a value into a `DateInstance`, returning the current date when
   * called without arguments.
   *
   * @param value The date value to parse.
   * @param format Optional format string (requires a date format plugin).
   */
  make: (value?: any, format?: string) => DateInstance
}

/**
 * A factory that produces the date module's `make` function from the module
 * options (`config.$date`).
 */
export type DateAdapter = (options?: DateModuleOptions) => DateModule['make']

/**
 * Configuration options for the date module (`config.$date`).
 */
export interface DateModuleOptions {
  /**
   * The date adapter — `nativeDateAdapter` (from `@vueform/core`), a date
   * library adapter (`@vueform/date-dayjs`, `@vueform/date-fns`,
   * `@vueform/date-luxon`), or a custom one. Required: `make` throws when
   * unset, so unused adapters are never bundled.
   */
  adapter?: DateAdapter
}
