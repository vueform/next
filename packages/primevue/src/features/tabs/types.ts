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
  tabs: (scope: { pager: Pager; class: ClassValue }) => VNode[]

  /**
   * Slot that replaces each individual tab.
   */
  tab: (scope: { page: ResolvedPage; class: ClassValue }) => VNode[]
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
   * @write
   *
   * @tag Tab
   */
  tab: (page: ResolvedPage) => TabProps
}

/**
 * @write
 */
export interface TabsClasses {
  /**
   * @write
   */
  tabs: ClassValue

  /**
   * @write
   */
  tab: (page: ResolvedPage) => ClassValue
}
