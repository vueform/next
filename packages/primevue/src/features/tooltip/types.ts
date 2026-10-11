import type { TProp } from '@vueform/core'

import type { TooltipPosProp } from '#src/types'

/**
 * Tooltip-related props mixed into element components that support tooltips.
 */
export interface TooltipProps {
  /**
   * Tooltip text content for the element.
   */
  tooltip?: TProp

  /**
   * Position of the tooltip relative to the element.
   */
  tooltipPos?: TooltipPosProp
}
