import { useDynamicProp } from '#core/composables'
import { defineFeature } from '#core/helpers'
import type { TProp } from '#core/types'

/**
 * Configuration for the icons factory providing before/after icon props.
 */
type MakeIconsOptions = {
  /**
   * The element's prop values used for icon resolution.
   */
  props: {
    /**
     * Icon to display before the input.
     */
    iconBefore: TProp | undefined

    /**
     * Icon to display after the input.
     */
    iconAfter: TProp | undefined
  }
}

/**
 * Resolves before/after icon props into CSS class strings using the
 * config-level icon resolver.
 *
 * @param options Factory options containing the element's icon props.
 */
export const makeIcons = defineFeature(() => ({ props }: MakeIconsOptions) => {
  // ============== COMPUTED ==============

  /**
   * The resolved CSS class string for the icon displayed before the input.
   */
  const iconBefore = useDynamicProp('iconBefore', props, {
    icon: true,
  })

  /**
   * The resolved CSS class string for the icon displayed after the input.
   */
  const iconAfter = useDynamicProp('iconAfter', props, {
    icon: true,
  })

  return {
    iconBefore,
    iconAfter,
  }
})
