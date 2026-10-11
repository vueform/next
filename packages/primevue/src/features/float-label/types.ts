import { type TProp, type ClassValue, type DOMAttrs } from '@vueform/core'
import type { FloatLabelProps as AFloatLabelProps } from 'primevue'
import type { VNode } from 'vue'

import type { FloatProp } from '#src/types'

/**
 * Float label props mixed into element components that support PrimeVue
 * floating labels.
 */
export interface FloatLabelProps {
  /**
   * Floating label behavior mode.
   */
  float?: FloatProp

  /**
   * The floating label text displayed inside the input.
   */
  floatLabel?: TProp
}

/**
 * Float label slot mixed into element components that support PrimeVue floating
 * labels.
 */
export interface FloatLabelSlots {
  /**
   * Slot for customizing the floating label content.
   *
   * @param scope The floatLabel slot's params.
   */
  floatLabel: (scope: {
    /**
     * The floating label text.
     */
    floatLabel?: string
  }) => VNode[]
}

/**
 * Structural parts for the float label wrapper.
 */
export interface FloatLabelParts {
  /**
   * The PrimeVue FloatLabel wrapper around the input.
   *
   * @tag FloatLabel
   */
  floatWrapper: AFloatLabelProps & Record<string, any>

  /**
   * The label tag inside PrimeVue FloatLabel.
   *
   * @tag label
   */
  float: DOMAttrs['label']
}

/**
 * CSS classes for float label structural parts.
 */
export interface FloatLabelClasses {
  /**
   * The PrimeVue FloatLabel.
   */
  floatWrapper: ClassValue

  /**
   * The label tag inside PrimeVue FloatLabel.
   */
  float: ClassValue
}
