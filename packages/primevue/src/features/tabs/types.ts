import type { Pager, PartBindings, ResolvedPage } from '@vueform/core'
import type { TabProps } from 'primevue/tab'
import type { TabListProps } from 'primevue/tablist'
import type { ClassValue, VNode } from 'vue'

/**
 * @write
 */
export interface TabbedSlots {
  /**
   * Slot that replaces the tabs navigation bar. Receives the pager instance.
   */
  tabs: (scope: {
    /**
     * The pager instance controlling the tabs.
     */
    pager: Pager

    /**
     * The tab list's resolved bindings (classes, part overrides); apply with
     * `v-bind`.
     */
    bindings: PartBindings<'tabs', TabbedParts>
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
     * The tab's resolved bindings (classes, part overrides, resolved with the
     * tab's page); apply with `v-bind`.
     */
    bindings: PartBindings<'tab', TabbedParts>
  }) => VNode[]
}

/**
 * @write
 */
export interface TabbedParts {
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
export interface TabbedClasses {
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
