import { type TProp, type ClassValue, type DOMAttrs } from '@vueform/core'
import type { IftaLabelProps as AIftaLabelProps } from 'primevue'
import type { VNode } from 'vue'

/**
 * IFTA label props mixed into element components that support in-field
 * top-aligned labels.
 */
export interface IftaLabelProps {
  /**
   * The IFTA (in-field top-aligned) label text for the input.
   */
  ifta?: TProp
}

/**
 * IFTA label slot mixed into element components that support in-field
 * top-aligned labels.
 */
export interface IftaSlots {
  /**
   * Slot for customizing the IFTA label content.
   *
   * @param props.ifta The IFTA label text.
   */
  ifta: (props: { ifta?: string }) => VNode[]
}

/**
 * Structural parts for the IFTA label wrapper.
 */
export interface IftaParts {
  /**
   * The PrimeVue IftaLabel wrapper around the input.
   *
   * @tag IftaLabel
   */
  iftaWrapper: AIftaLabelProps & Record<string, any>

  /**
   * The label tag inside PrimeVue IftaLabel.
   *
   * @tag label
   */
  ifta: DOMAttrs['label']
}

/**
 * CSS classes for IFTA label structural parts.
 */
export interface IftaClasses {
  /**
   * The PrimeVue IftaLabel.
   */
  iftaWrapper: ClassValue

  /**
   * The label tag inside PrimeVue IftaLabel.
   */
  ifta: ClassValue
}
