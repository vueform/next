import type {
  ComponentRegistry,
  ComponentNames,
  ComponentOptions,
  ElementRegistry,
  ElementNames,
  PresetDefinition,
} from '~/types'

/**
 * Optional flags that control how a preset cascades and merges with other
 * presets.
 */
type PresetMeta = {
  $cascade?: boolean
  $merge?: boolean
}

/**
 * Defines a component preset with typed prop overrides scoped to one or more
 * components.
 *
 * @param preset Preset definition specifying target components and prop
 *   overrides.
 */
export function definePreset<T extends ComponentNames>(
  preset: { $apply: T } & PresetMeta & Partial<ComponentRegistry[T]['props']>
): PresetDefinition

export function definePreset(
  preset: { $apply: '*element' } & PresetMeta &
    Partial<ElementRegistry[ElementNames]['props']> &
    Record<string, any>
): PresetDefinition

export function definePreset<T extends ComponentNames>(
  preset: { $apply: T[] } & PresetMeta &
    Partial<ComponentRegistry[T]['props']> &
    Record<string, any>
): PresetDefinition

export function definePreset(
  preset: { $apply: (component: ComponentOptions) => boolean } & PresetMeta &
    Record<string, any>
): PresetDefinition

export function definePreset(preset: PresetDefinition): PresetDefinition

export function definePreset(preset: any): PresetDefinition {
  return preset
}
