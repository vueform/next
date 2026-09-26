import type { InfoPositionProp } from '#primevue/types'
import type { TProp } from '@vueform/core'

/**
 * Info-related props mixed into element components that support info tooltips.
 */
export interface InfoProps {
  /**
   * Informational text displayed as a tooltip for the element.
   */
  info?: TProp

  /**
   * Position of the info tooltip relative to the info icon.
   *
   * @default 'top'
   */
  infoPosition?: InfoPositionProp
}
