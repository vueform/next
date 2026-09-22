import { warn } from '~/utils'
import type { DateAdapter, DateInstance, DateModule, DateUnit } from './types'

type NormalizedUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

let formatWarned = false
let parseWarned = false

const PLUGIN_WARN =
  'A date format plugin is required for format-aware parsing. ' +
  'Install @vueform/date-dayjs, @vueform/date-fns, or @vueform/date-luxon.'

class VueformDate implements DateInstance {
  _d: Date

  constructor(d: Date) {
    this._d = d
  }

  isValid(): boolean {
    return !isNaN(this._d.getTime())
  }

  year(): number {
    return this._d.getFullYear()
  }

  month(): number {
    return this._d.getMonth() + 1
  }

  date(): number {
    return this._d.getDate()
  }

  day(): number {
    return this._d.getDay()
  }

  hour(): number {
    return this._d.getHours()
  }

  minute(): number {
    return this._d.getMinutes()
  }

  second(): number {
    return this._d.getSeconds()
  }

  millisecond(): number {
    return this._d.getMilliseconds()
  }

  add(amount: number, unit: DateUnit): VueformDate {
    const d = new Date(this._d.getTime())

    switch (norm(unit)) {
      case 'year':
        d.setFullYear(d.getFullYear() + amount)
        break
      case 'month':
        d.setMonth(d.getMonth() + amount)
        break
      case 'week':
        d.setDate(d.getDate() + amount * 7)
        break
      case 'day':
        d.setDate(d.getDate() + amount)
        break
      case 'hour':
        d.setTime(d.getTime() + amount * 3_600_000)
        break
      case 'minute':
        d.setTime(d.getTime() + amount * 60_000)
        break
      case 'second':
        d.setTime(d.getTime() + amount * 1_000)
        break
      case 'millisecond':
        d.setTime(d.getTime() + amount)
        break
    }

    return new VueformDate(d)
  }

  subtract(amount: number, unit: DateUnit): VueformDate {
    return this.add(-amount, unit)
  }

  startOf(unit: DateUnit): VueformDate {
    const d = new Date(this._d.getTime())

    switch (norm(unit)) {
      case 'year':
        d.setMonth(0, 1)
        d.setHours(0, 0, 0, 0)
        break
      case 'month':
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        break
      case 'week':
        d.setDate(d.getDate() - d.getDay())
        d.setHours(0, 0, 0, 0)
        break
      case 'day':
        d.setHours(0, 0, 0, 0)
        break
      case 'hour':
        d.setMinutes(0, 0, 0)
        break
      case 'minute':
        d.setSeconds(0, 0)
        break
      case 'second':
        d.setMilliseconds(0)
        break
      case 'millisecond':
        break
    }

    return new VueformDate(d)
  }

  endOf(unit: DateUnit): VueformDate {
    const d = new Date(this._d.getTime())

    switch (norm(unit)) {
      case 'year':
        d.setMonth(11, 31)
        d.setHours(23, 59, 59, 999)
        break
      case 'month':
        d.setMonth(d.getMonth() + 1, 0)
        d.setHours(23, 59, 59, 999)
        break
      case 'week':
        d.setDate(d.getDate() + (6 - d.getDay()))
        d.setHours(23, 59, 59, 999)
        break
      case 'day':
        d.setHours(23, 59, 59, 999)
        break
      case 'hour':
        d.setMinutes(59, 59, 999)
        break
      case 'minute':
        d.setSeconds(59, 999)
        break
      case 'second':
        d.setMilliseconds(999)
        break
      case 'millisecond':
        break
    }

    return new VueformDate(d)
  }

  set(unit: DateUnit, value: number): VueformDate {
    const d = new Date(this._d.getTime())

    switch (norm(unit)) {
      case 'year':
        d.setFullYear(value)
        break
      case 'month':
        d.setMonth(value - 1)
        break
      case 'week':
        break
      case 'day':
        d.setDate(value)
        break
      case 'hour':
        d.setHours(value)
        break
      case 'minute':
        d.setMinutes(value)
        break
      case 'second':
        d.setSeconds(value)
        break
      case 'millisecond':
        d.setMilliseconds(value)
        break
    }

    return new VueformDate(d)
  }

  isBefore(other: DateInstance, granularity?: DateUnit): boolean {
    if (granularity) {
      return (
        this.startOf(granularity).valueOf() <
        other.startOf(granularity).valueOf()
      )
    }
    return this.valueOf() < other.valueOf()
  }

  isAfter(other: DateInstance, granularity?: DateUnit): boolean {
    if (granularity) {
      return (
        this.startOf(granularity).valueOf() >
        other.startOf(granularity).valueOf()
      )
    }
    return this.valueOf() > other.valueOf()
  }

  isSame(other: DateInstance, granularity?: DateUnit): boolean {
    if (granularity) {
      return (
        this.startOf(granularity).valueOf() ===
        other.startOf(granularity).valueOf()
      )
    }
    return this.valueOf() === other.valueOf()
  }

  isSameOrBefore(other: DateInstance, granularity?: DateUnit): boolean {
    return this.isSame(other, granularity) || this.isBefore(other, granularity)
  }

  isSameOrAfter(other: DateInstance, granularity?: DateUnit): boolean {
    return this.isSame(other, granularity) || this.isAfter(other, granularity)
  }

  isBetween(
    start: DateInstance,
    end: DateInstance,
    granularity?: DateUnit,
    inclusivity: '()' | '[)' | '(]' | '[]' = '()'
  ): boolean {
    const a = granularity ? this.startOf(granularity).valueOf() : this.valueOf()
    const s = granularity
      ? start.startOf(granularity).valueOf()
      : start.valueOf()
    const e = granularity ? end.startOf(granularity).valueOf() : end.valueOf()

    const afterStart = inclusivity[0] === '[' ? a >= s : a > s
    const beforeEnd = inclusivity[1] === ']' ? a <= e : a < e

    return afterStart && beforeEnd
  }

  diff(other: DateInstance, unit?: DateUnit): number {
    if (!unit) return this.valueOf() - other.valueOf()

    const ms = this.valueOf() - other.valueOf()

    switch (norm(unit)) {
      case 'year':
        return Math.trunc(diffMonths(this, other) / 12)
      case 'month':
        return diffMonths(this, other)
      case 'week':
        return Math.trunc(ms / 604_800_000)
      case 'day':
        return Math.trunc(ms / 86_400_000)
      case 'hour':
        return Math.trunc(ms / 3_600_000)
      case 'minute':
        return Math.trunc(ms / 60_000)
      case 'second':
        return Math.trunc(ms / 1_000)
      case 'millisecond':
        return ms
      default:
        return ms
    }
  }

  toDate(): Date {
    return new Date(this._d.getTime())
  }

  toISOString(): string {
    return this._d.toISOString()
  }

  toISODate(): string {
    const y = String(this._d.getFullYear()).padStart(4, '0')
    const m = String(this._d.getMonth() + 1).padStart(2, '0')
    const d = String(this._d.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  valueOf(): number {
    return this._d.getTime()
  }

  unix(): number {
    return Math.floor(this._d.getTime() / 1_000)
  }

  clone(): VueformDate {
    return new VueformDate(new Date(this._d.getTime()))
  }

  format(_formatString: string): string {
    if (!formatWarned) {
      warn(PLUGIN_WARN)
      formatWarned = true
    }

    return this.toISOString()
  }
}

function norm(unit: DateUnit): NormalizedUnit {
  return unit.replace(/s$/, '') as NormalizedUnit
}

function diffMonths(a: DateInstance, b: DateInstance): number {
  const months = (a.year() - b.year()) * 12 + (a.month() - b.month())
  const dayA = a.date()
  const dayB = b.date()

  if (months > 0 && dayA < dayB) return months - 1
  if (months < 0 && dayA > dayB) return months + 1

  return months
}

/**
 * The native `Date`-backed adapter: no dependencies, ISO / common datetime
 * string parsing, no format-aware parsing or formatting (`format()` warns and
 * falls back to ISO). Not wired in by default — presets that want it configure
 * it explicitly via `$date.adapter`, so consumers who bring their own adapter
 * (`@vueform/date-dayjs`, `@vueform/date-fns`, `@vueform/date-luxon`, or a
 * custom one) never bundle this implementation.
 */
export const nativeDateAdapter: DateAdapter = (): DateModule['make'] => {
  return (
    value?: string | number | Date | DateInstance,
    format?: string
  ): DateInstance => {
    if (format) {
      if (!parseWarned) {
        warn(PLUGIN_WARN)
        parseWarned = true
      }
    }

    if (value === undefined || value === null) {
      return new VueformDate(new Date())
    }

    if (value instanceof VueformDate) {
      return value.clone()
    }

    if (value instanceof Date) {
      return new VueformDate(new Date(value.getTime()))
    }

    if (typeof value === 'number') {
      return new VueformDate(new Date(value))
    }

    if (
      typeof value === 'object' &&
      typeof (value as any).toDate === 'function'
    ) {
      return new VueformDate(new Date((value as any).toDate().getTime()))
    }

    const str = String(value)

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number)
      return new VueformDate(new Date(y, m - 1, d))
    }

    // YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss — parse as local time
    const dtMatch = str.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/
    )
    if (dtMatch) {
      const [, yr, mo, dy, hr, mi, sc] = dtMatch
      return new VueformDate(new Date(+yr, +mo - 1, +dy, +hr, +mi, +(sc || 0)))
    }

    return new VueformDate(new Date(str))
  }
}
