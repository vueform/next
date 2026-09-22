import { defineFeature, type TProp, useDynamicProp } from '@vueform/core'

/**
 * Configuration for the float label factory resolving floating label text for
 * input elements.
 */
type MakeFloatLabelOptions = {
  /**
   * The element's prop values used for float label resolution.
   */
  props: {
    /**
     * The floating label text displayed inside the input.
     */
    floatLabel: TProp | undefined
  }
}

/**
 * Resolves the floating label text for input elements.
 *
 * @param options Factory options containing element props.
 */
export const makeFloatLabel = defineFeature(
  () =>
    ({ props }: MakeFloatLabelOptions) => {
      // ============== COMPUTED ==============

      /**
       * The resolved floating label text, supporting static strings and dynamic
       * text props.
       */
      const floatLabel = useDynamicProp('floatLabel', props, {
        localize: true,
      })

      return {
        floatLabel,
      }
    }
)
