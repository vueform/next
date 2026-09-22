```ts
/**
 * Defines a component preset with typed prop overrides scoped to one or more
 * components.
 *
 * @param preset Preset definition specifying target components and prop
 *   overrides.
 */
function definePreset<T extends ComponentNames>(
  preset: { $apply: T } & PresetMeta & Partial<ComponentRegistry[T]['props']>
): PresetDefinition

function definePreset(
  preset: { $apply: '*element' } & PresetMeta &
    Partial<ElementRegistry[ElementNames]['props']> &
    Record<string, any>
): PresetDefinition

function definePreset<T extends ComponentNames>(
  preset: { $apply: T[] } & PresetMeta &
    Partial<ComponentRegistry[T]['props']> &
    Record<string, any>
): PresetDefinition

function definePreset(
  preset: { $apply: (component: ComponentOptions) => boolean } & PresetMeta &
    Record<string, any>
): PresetDefinition

function definePreset(preset: PresetDefinition): PresetDefinition
```
