import type { VNode } from 'vue'

import {
  type Pager,
  type PartBindings,
  type ResolvedPage,
} from '#src/composables'
import type { PartOf, SlotPropsOf } from '#src/types'

/**
 * Props for components that support tabbed navigation.
 */
export interface TabbedProps {
  /**
   * Whether to render the form in a tabbed layout.
   */
  tabbed?: boolean
}

/**
 * Events emitted by components that support tabbed navigation.
 */
export interface TabbedEmits {
  /**
   * Emitted when the active tab changes.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated from.
   * @param pager The pager instance managing tab state.
   * @param context$ The component's context instance.
   */
  tab: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: any,
  ]

  /**
   * Emitted before the active tab changes, allowing cancellation.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated from.
   * @param pager The pager instance managing tab state.
   * @param context$ The component's context instance.
   */
  beforeTab: [
    newPage: ResolvedPage,
    oldPage: ResolvedPage,
    pager: Pager,
    context$: any,
  ]
}

export interface TabbedSlots {
  /**
   * Slot for customizing the tab navigation bar.
   *
   * @param scope The tabs slot's params.
   */
  tabs: (scope: {
    /**
     * The pager instance managing tab state.
     */
    pager: Pager

    /**
     * The tab navigation bar's resolved bindings (classes, part overrides);
     * apply with `v-bind`.
     */
    bindings: PartBindings<'tabs', TabbedParts>
  }) => VNode[]

  /**
   * Slot for customizing an individual tab button.
   *
   * @inherits VfTabs.default
   */
  tab: (scope: SlotPropsOf<'VfTabs', 'default'>) => VNode[]
}

export interface TabbedParts {
  /**
   * Props forwarded to the nested VfTabs component.
   *
   * @tag VfTabs
   */
  tabs: PartOf<'VfTabs'>
}
