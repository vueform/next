import { createContext } from '@core/helpers'
import type { NormalizedPresetDefinition } from '@core/types'
import type { Ref } from 'vue'

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
 *
 * @context
 */
export function usePresetContext(): PresetContext | undefined {
  return _usePresetContext()
}
