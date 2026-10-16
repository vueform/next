import { toRaw } from 'vue'

import { BASE_CLASS_REGISTRAR, useElementContext } from '#src/contexts'
import { warn, isDev } from '#src/utils'

import { useConfig } from './useConfig'

/**
 * Wraps static override values back into functions for keys the layout's own
 * map defines as functional.
 *
 * @param overrides The `layoutClasses` config overrides.
 * @param reference The layout's own map, whose functional keys set the
 *   contract.
 */
const normalizeLayoutClasses = (
  overrides: Record<string, any>,
  reference: Record<string, any>
): Record<string, any> => {
  const normalized: Record<string, any> = {}

  for (const key of Object.keys(overrides)) {
    const value = overrides[key]
    normalized[key] =
      typeof reference[key] === 'function' &&
      value != null &&
      typeof value !== 'function'
        ? () => value
        : value
  }

  return normalized
}

/**
 * Installs the shared element classes a layout component stands for (`root`,
 * `label`, `errors`, …) at the bottom of the host element's class chain,
 * applying `layoutClasses` config overrides per key.
 *
 * @private
 * @param defs The layout's shared class map.
 */
export function useLayoutClasses(defs: Record<string, any>) {
  const el$ = useElementContext()
  const setBaseClasses = el$ && (toRaw(el$) as any)[BASE_CLASS_REGISTRAR as any]

  if (typeof setBaseClasses !== 'function') {
    if (isDev()) {
      warn(
        '`useLayoutClasses()` must be called in the setup of a layout rendered by a Vueform element'
      )
    }
    return
  }

  const overrides = useConfig().layoutClasses

  setBaseClasses(
    overrides ? { ...defs, ...normalizeLayoutClasses(overrides, defs) } : defs
  )
}
