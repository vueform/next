import { type ComponentNames, type MaybeArray } from '~/types'
import type { ComponentOptions } from 'vue'

/**
 * A preset definition after normalization, with `$apply` and `$cascade`
 * resolved to their canonical forms.
 */
export type NormalizedPresetDefinition = {
  /**
   * The list of component names or a matcher function that determines which
   * components receive this preset.
   */
  $apply:
    | (ComponentNames | 'this' | '*' | '*element' | (string & {}))[]
    | ((component: ComponentOptions) => boolean)

  /**
   * Whether this preset should cascade to child components.
   */
  $cascade: boolean
} & Record<string, any>

/**
 * A user-facing preset definition that can be a single object or an array, with
 * optional `$apply`, `$cascade`, and `$merge` directives.
 */
export type PresetDefinition = MaybeArray<
  {
    /**
     * Specifies which components receive this preset, as a name, array of
     * names, or a matcher function.
     */
    $apply?:
      | MaybeArray<ComponentNames | 'this' | '*' | '*element' | (string & {})>
      | ((component: ComponentOptions) => boolean)

    /**
     * Whether this preset should cascade to child components.
     */
    $cascade?: boolean

    /**
     * Whether this preset should be merged with existing values instead of
     * replacing them.
     */
    $merge?: boolean
  } & Record<string, any>
>
