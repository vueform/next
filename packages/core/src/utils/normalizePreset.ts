import type { PresetDefinition, NormalizedPresetDefinition } from '~/types'

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
