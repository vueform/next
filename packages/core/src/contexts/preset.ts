import type { Ref } from 'vue'

import { createContext } from '#src/helpers'
import type { NormalizedPresetDefinition } from '#src/types'

/**
 * A reactive ref holding the normalized preset definitions for the current
 * scope.
 */
export type PresetContext = Ref<NormalizedPresetDefinition[]>

const [_usePresetContext, providePresetContext] =
  createContext<PresetContext>('vueform-preset')

/**
 * Provides normalized preset definitions to descendant components.
 *
 * @param presets Reactive ref of normalized preset definitions.
 */
export function createPresetContext(presets: PresetContext): PresetContext {
  providePresetContext(presets)

  return presets
}

/**
 * Injects the preset context containing the normalized preset definitions for
 * the current component scope.
 */
export function usePresetContext(): PresetContext | undefined {
  return _usePresetContext()
}
