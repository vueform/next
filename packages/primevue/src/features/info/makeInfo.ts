import { defineFeature, type TProp, useDynamicProp } from '@vueform/core'
import { toRef } from 'vue'
import type { InfoPositionProp } from '#primevue/types'

/**
 * Configuration for the info factory resolving informational tooltip or helper
 * text for input elements.
 */
type MakeInfoOptions = {
  /**
   * The element's prop values used for info text resolution.
   */
  props: {
    /**
     * Informational text displayed as a helper or tooltip for the input.
     */
    info: TProp | undefined

    /**
     * Position of the info tooltip relative to the info icon.
     */
    infoPosition: InfoPositionProp | undefined
  }
}

/**
 * Resolves the informational helper text and tooltip position for input
 * elements.
 *
 * @param options Factory options containing element props.
 */
export const makeInfo = defineFeature(() => ({ props }: MakeInfoOptions) => {
  // ============== COMPUTED ==============

  /**
   * The resolved info text, supporting static strings and dynamic text props.
   */
  const info = useDynamicProp('info', props, {
    localize: true,
  })

  /**
   * The resolved tooltip position for the info icon.
   */
  const infoPosition = toRef(() => props.infoPosition ?? 'right')

  return {
    info,
    infoPosition,
  }
})
