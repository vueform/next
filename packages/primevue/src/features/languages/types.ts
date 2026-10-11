import type { ResolvedLanguagesProp } from '@vueform/core'
import type { TabProps } from 'primevue/tab'
import type { TabListProps } from 'primevue/tablist'
import type { ClassValue, VNode } from 'vue'

/**
 * @write
 */
export interface LanguagesSlots {
  /**
   * Slot that replaces the language navigation bar. Receives the available
   * languages and the current selection.
   */
  languages: (scope: {
    languages: ResolvedLanguagesProp
    language: string
    invalidLanguages: Set<string>
    select: (language: string) => void
    class: ClassValue
  }) => VNode[]

  /**
   * Slot that replaces each individual language tab.
   */
  language: (scope: {
    value: string
    label: string
    selected: boolean
    invalid: boolean
    class: ClassValue
  }) => VNode[]
}

/**
 * @write
 */
export interface LanguagesParts {
  /**
   * Props forwarded to the nested TabList component.
   *
   * @tag TabList
   */
  languages: TabListProps

  /**
   * Props forwarded to each language Tab component.
   *
   * @param selected Whether this language is currently selected.
   * @param invalid Whether this language has validation errors.
   * @tag Tab
   */
  language: (selected: boolean, invalid: boolean) => TabProps
}

/**
 * @write
 */
export interface LanguagesClasses {
  /**
   * @write
   */
  languages: ClassValue

  /**
   * @write
   */
  language: (selected: boolean, invalid: boolean) => ClassValue
}
