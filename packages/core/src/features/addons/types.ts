import type { VNode } from 'vue'

import {
  type AddonProp,
  type AddonItem,
  type PartOf,
  type ClassValue,
  type DomAttrsOf,
} from '#src/types'

/**
 * @write
 */
export interface AddonableProps {
  /**
   * Allows rendering the element as the value. (used internally)
   *
   * @private
   */
  as?: 'addon'
}

/**
 * Props for elements that support before/after addon slots.
 */
export interface AddonsProps<TContext = any> {
  /**
   * Content or schema rendered as addons before the input.
   */
  addonBefore?: AddonProp<TContext>

  /**
   * Content or schema rendered as addons after the input.
   */
  addonAfter?: AddonProp<TContext>
}

/**
 * Slot definitions for elements that support before/after addons.
 */
export interface AddonsSlots {
  /**
   * Slot that replaces the before-addons section.
   *
   * @param scope The addonBefore slot's params.
   */
  addonBefore: (scope: {
    /**
     * The resolved before-addon prop value.
     */
    addonBefore: AddonProp | undefined
  }) => VNode[]

  /**
   * Slot that replaces the after-addons section.
   *
   * @param scope The addonAfter slot's params.
   */
  addonAfter: (scope: {
    /**
     * The resolved after-addon prop value.
     */
    addonAfter: AddonProp | undefined
  }) => VNode[]
}

/**
 * Part definitions for elements that support before/after addons.
 */
export interface AddonsParts {
  /**
   * An individual addon rendered before the input.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   * @tag VfAddon
   */
  addonBefore: (addon: AddonItem, index: number) => PartOf<'VfAddon'>

  /**
   * An individual addon rendered after the input.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   * @tag VfAddon
   */
  addonAfter: (addon: AddonItem, index: number) => PartOf<'VfAddon'>
}

/**
 * @write
 */
export interface AddonGroupParts {
  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>
}

/**
 * Class definitions for elements that wrap their input in an addon group
 * container.
 */
export interface AddonGroupClasses {
  /**
   * The addon group wrapper element.
   */
  addonGroup: ClassValue
}
