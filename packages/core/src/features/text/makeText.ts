import { useDynamicProp } from '~/composables'
import { defineFeature } from '~/helpers'
import type { TProp } from '~/types'

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
