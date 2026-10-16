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

/**
 * Defines a preset applied to every element type.
 *
 * @param preset Preset definition targeting all elements (`$apply:
 *   '*element'`) with prop overrides.
 */
function definePreset(
  preset: { $apply: '*element' } & PresetMeta &
    Partial<ElementRegistry[ElementNames]['props']> &
    Record<string, any>
): PresetDefinition

/**
 * Defines a preset scoped to multiple components.
 *
 * @param preset Preset definition targeting an array of components with prop
 *   overrides.
 */
function definePreset<T extends ComponentNames>(
  preset: { $apply: T[] } & PresetMeta &
    Partial<ComponentRegistry[T]['props']> &
    Record<string, any>
): PresetDefinition

/**
 * Defines a preset whose targets are matched by a custom predicate.
 *
 * @param preset Preset definition with an `$apply` predicate matching
 *   components, plus prop overrides.
 */
function definePreset(
  preset: { $apply: (component: ComponentOptions) => boolean } & PresetMeta &
    Record<string, any>
): PresetDefinition

/**
 * Defines a preset from a prebuilt preset definition object.
 *
 * @param preset The preset definition object.
 */
function definePreset(preset: PresetDefinition): PresetDefinition
```
