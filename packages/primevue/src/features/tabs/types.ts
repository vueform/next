import type { Pager, ResolvedPage } from '@vueform/core'
import type { TabProps } from 'primevue/tab'
import type { TabListProps } from 'primevue/tablist'
import type { ClassValue, VNode } from 'vue'

/**
 * @write
 */
export interface TabsSlots {
  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (scope: {
    /**
     * The pager instance controlling the tabs.
     */
    pager: Pager

    /**
     * CSS classes to apply to the tab list.
     */
    class: ClassValue
  }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (scope: {
    /**
     * The resolved page of the tab.
     */
    page: ResolvedPage

    /**
     * CSS classes to apply to the tab.
     */
    class: ClassValue
  }) => VNode[]
}

/**
 * @write
 */
export interface TabsParts {
  /**
   * Props forwarded to the nested TabList component.
   *
   * @tag TabList
   */
  tabs: TabListProps

  /**
   * Props forwarded to each nested Tab component.
   *
   * @param page The tab’s resolved page.
   * @tag Tab
   */
  tab: (page: ResolvedPage) => TabProps
}

/**
 * @write
 */
export interface TabsClasses {
  /**
   * The tab list element.
   */
  tabs: ClassValue

  /**
   * Each individual tab element.
   *
   * @param page The tab’s resolved page.
   */
  tab: (page: ResolvedPage) => ClassValue
}
