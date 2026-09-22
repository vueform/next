import { defineFeature, type TProp, useDynamicProp } from '@vueform/core'
import { computed } from 'vue'
import type { TooltipPosProp } from '@/types'

/**
 * Configuration for the tooltip factory resolving tooltip content and
 * directives for input elements.
 */
type MakeTooltipOptions = {
  /**
   * The element's prop values used for tooltip resolution.
   */
  props: {
    /**
     * The tooltip text content for the input element.
     */
    tooltip: TProp | undefined

    /**
     * The position of the tooltip relative to the element.
     */
    tooltipPos: TooltipPosProp | undefined
  }
}

/**
 * @write
 */
type MakeTooltipConfig = {
  /**
   * @write
   */
  event: 'focus' | 'hover'
}

/**
 * Resolves tooltip content, position modifiers, and directive bindings for
 * input elements.
 *
 * @param options Factory options containing element props.
 */
export const makeTooltip = defineFeature(
  (config?: MakeTooltipConfig) =>
    ({ props }: MakeTooltipOptions) => {
      // ============== COMPUTED ==============

      /**
       * The resolved tooltip text, supporting static strings and dynamic text
       * props.
       */
      const tooltip = useDynamicProp('tooltip', props, {
        localize: true,
      })

      /**
       * Modifier options for the PrimeVue tooltip directive, including position
       * and trigger event.
       */
      const tooltipModifiers = computed(() => ({
        position: props.tooltipPos,
        event: config?.event || 'focus',
      }))

      /**
       * Value binding for the PrimeVue tooltip directive containing the
       * resolved tooltip text.
       */
      const tooltipValue = computed(() => ({
        value: tooltip.value,
      }))

      return {
        tooltip,
        tooltipModifiers,
        tooltipValue,
      }
    }
)
