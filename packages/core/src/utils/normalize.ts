import { isForbiddenKey, isPlainObject, typedEntries } from '@core/utils'

/**
 * Recursively normalizes a value by parsing numeric strings into numbers.
 *
 * @param value The value to normalize.
 * @param active Whether normalization is active (pass `false` to return the
 *   value as-is).
 */
export function normalize(value: any, active = true): any {
  if (!active) return value

  if (isPlainObject(value)) {
    const normalized: Record<string, any> = {}
    for (const [key, v] of typedEntries(value)) {
      // An own `__proto__` key from parsed JSON would re-point the result's
      // prototype through this assignment — never carry forbidden keys over.
      if (isForbiddenKey(key as string)) continue

      normalized[key] = normalize(v, active)
    }
    return normalized
  }

  if (value === undefined || typeof value !== 'string') {
    return value
  }

  // is number
  if (value.match(/^-*\d+$/)) {
    return parseInt(value, 10)

    // is float
  } else if (value.match(/^\d+\.\d+$/)) {
    return parseFloat(value)

    // everything else
  } else {
    return value
  }
}
