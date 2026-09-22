import { defineFeature, type TProp, useDynamicProp } from '@vueform/core'

/**
 * Configuration for the IFTA label factory resolving in-field top-aligned label
 * text for input elements.
 */
type MakeIftaOptions = {
  /**
   * The element's prop values used for IFTA label resolution.
   */
  props: {
    /**
     * The IFTA (in-field top-aligned) label text for the input.
     */
    ifta: TProp | undefined
  }
}

/**
 * Resolves the IFTA label text for input elements.
 *
 * @param options Factory options containing element props.
 */
export const makeIfta = defineFeature(() => ({ props }: MakeIftaOptions) => {
  // ============== COMPUTED ==============

  /**
   * The resolved IFTA label text, supporting static strings and dynamic text
   * props.
   */
  const ifta = useDynamicProp('ifta', props, {
    localize: true,
  })

  return {
    ifta,
  }
})
