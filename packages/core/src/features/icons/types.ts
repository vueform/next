import type { VNode } from 'vue'

import {
  type ClassValue,
  type DomAttrsOf,
  type PartOf,
  type DProp,
} from '#src/types'

/**
 * Props for elements that support before/after icon slots.
 */
export interface IconsProps<TContext = any> {
  /**
   * Icon displayed before the input.
   */
  iconBefore?: DProp<string, TContext>

  /**
   * Icon displayed after the input.
   */
  iconAfter?: DProp<string, TContext>
}

/**
 * Slot definitions for elements that support before/after icons.
 */
export interface IconsSlots {
  /**
   * Slot that replaces the icon rendered before the input.
   *
   * @param scope The iconBefore slot's params.
   */
  iconBefore: (scope: {
    /**
     * The resolved icon class string.
     */
    iconBefore: string | undefined
  }) => VNode[]

  /**
   * Slot that replaces the icon rendered after the input.
   *
   * @param scope The iconAfter slot's params.
   */
  iconAfter: (scope: {
    /**
     * The resolved icon class string.
     */
    iconAfter: string | undefined
  }) => VNode[]
}

/**
 * Part definitions for elements that support before/after icons.
 */
export interface IconsParts {
  /**
   * The icon rendered before the input.
   *
   * @tag VfIcon
   */
  iconBefore: PartOf<'VfIcon'>

  /**
   * The icon rendered after the input.
   *
   * @tag VfIcon
   */
  iconAfter: PartOf<'VfIcon'>

  /**
   * The wrapper element grouping icons and the input.
   *
   * @tag div
   */
  iconGroup: DomAttrsOf<'div'>
}

/**
 * Class definitions for elements that support before/after icons.
 */
export interface IconsClasses {
  /**
   * The wrapper element grouping icons and the input.
   */
  iconGroup: ClassValue

  /**
   * The icon rendered before the input.
   */
  iconBefore: ClassValue

  /**
   * The icon rendered after the input.
   */
  iconAfter: ClassValue
}
