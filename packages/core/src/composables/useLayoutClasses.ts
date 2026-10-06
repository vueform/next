import { toRaw } from 'vue'

import { BASE_CLASS_REGISTRAR, useElementContext } from '#core/contexts'
import { warn, isDev } from '#core/utils'

import { useConfig } from './useConfig'

/**
 * Wraps static values back into functions for keys the layout's own map defines
 * as functional (e.g. `root`), so templates that call the key keep working when
 * an override supplies a plain value.
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
 * `label`, `errors`, …) at the bottom of the HOST ELEMENT's class chain — the
 * element's `reclass` replaces them, its `classes` merges on top. Called from
 * the layout's setup with its class map inline.
 *
 * The `layoutClasses` config option overrides the map per key: a key it sets
 * replaces that key's layout-provided value, every other key keeps the layout's
 * default. Static values for keys the layout's map defines as functions (e.g.
 * `root`) are wrapped back into functions.
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
