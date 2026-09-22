import {
  defineFeature,
  useDynamicProp,
  type DProp,
  type makeData,
  type ReturnsOf,
} from '@vueform/core'
import { watch } from 'vue'

/**
 * Configuration for the interval factory resolving min, max, and step
 * boundaries.
 */
type MakeIntervalOptions = {
  /**
   * The element's prop values used for interval resolution.
   */
  props: {
    /**
     * Minimum boundary value. Accepts expressions.
     */
    min: DProp<number> | undefined

    /**
     * Maximum boundary value. Accepts expressions.
     */
    max: DProp<number> | undefined

    /**
     * Step factor to increment/decrement the value. Accepts expressions.
     */
    step: DProp<number> | undefined
  }
  /**
   * Resolved dependencies from earlier factories.
   */
  deps: ReturnsOf<[[typeof makeData, ['update', 'value']]]>
}

/**
 * Resolves dynamic min, max, and step boundaries and clamps the element value
 * when the resolved bounds change.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
export const makeInterval = defineFeature(
  () =>
    ({ props, deps }: MakeIntervalOptions) => {
      const { update, value } = deps

      /**
       * The resolved minimum boundary value.
       */
      const min = useDynamicProp('min', props, {
        number: true,
      })

      /**
       * The resolved maximum boundary value.
       */
      const max = useDynamicProp('max', props, {
        number: true,
      })

      /**
       * The resolved step factor.
       */
      const step = useDynamicProp('step', props, {
        number: true,
      })

      // ============== WATCHERS ==============

      watch([min, max], ([newMin, newMax]) => {
        if (value.value == null) return

        if (newMin != null && value.value < newMin) {
          update(newMin)
        } else if (newMax != null && value.value > newMax) {
          update(newMax)
        }
      })

      return {
        min,
        max,
        step,
      }
    }
)
