import type { PartOf, SlotPropsOf } from '#core/types'
import type { VNode } from 'vue'
import { type Pager, type ResolvedPage } from '#core/composables'

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
   * @param props.pager The pager instance managing tab state.
   */
  tabs: (props: { pager: Pager }) => VNode[]

  /**
   * Slot for customizing an individual tab button.
   *
   * @inherits VfTabs.default
   */
  tab: (props: SlotPropsOf<'VfTabs', 'default'>) => VNode[]
}

export interface TabbedParts {
  /**
   * Props forwarded to the nested VfTabs component.
   *
   * @tag VfTabs
   */
  tabs: PartOf<'VfTabs'>
}
