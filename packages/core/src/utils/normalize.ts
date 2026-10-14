import type { PresetDefinition, NormalizedPresetDefinition } from '#src/types'
import { isForbiddenKey, isPlainObject, typedEntries } from '#src/utils'

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

/**
 * Normalizes a preset definition into an array with resolved `$apply`,
 * `$cascade`, and `$merge` defaults.
 *
 * @param value A single preset definition or array of preset definitions.
 */
export function normalizePreset(value: PresetDefinition) {
  const preset = Array.isArray(value) ? value : [value]

  return preset.map((one) => {
    const value = { ...one }

    if (
      value.$cascade === undefined &&
      (!value.$apply ||
        value.$apply === 'this' ||
        (Array.isArray(value.$apply) &&
          value.$apply.length === 1 &&
          value.$apply[0] === 'this'))
    ) {
      value.$cascade = false
    }

    if (!value.$apply) {
      // Without `$apply`, an explicitly cascading preset means "apply to the
      // component and everything below it". Otherwise it targets the
      // component it was attached to only.
      value.$apply = value.$cascade === true ? ['*'] : ['this']
    }

    if (typeof value.$apply !== 'function' && !Array.isArray(value.$apply)) {
      value.$apply = [value.$apply]
    }

    if (value.$cascade === undefined) {
      value.$cascade = true
    }

    if (value.$merge === undefined) {
      value.$merge = true
    }

    return value
  }) as unknown as NormalizedPresetDefinition[]
}
