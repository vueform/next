import { useDynamicProp } from '#core/composables'
import { defineFeature } from '#core/helpers'
import type { TProp } from '#core/types'

/**
 * Configuration for the text label factory resolving label and related text for
 * inputs.
 */
type MakeTextOptions = {
  props: {
    /**
     * @write
     */
    text: TProp | undefined
  }
}

/**
 * Resolves the text label.
 *
 * @param options Factory options containing element props.
 */
export const makeText = defineFeature(() => ({ props }: MakeTextOptions) => {
  // ============== COMPUTED ==============

  /**
   * The resolved text content, supporting static strings and dynamic text
   * props.
   */
  const text = useDynamicProp('text', props, {
    localize: true,
  })

  return {
    text,
  }
})
