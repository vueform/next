import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type { SuggestionsProp } from '#src/features'

import VfAutoComplete, { type VfAutoCompleteEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfAutoComplete: VfAutoCompleteEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfAutoComplete: typeof VfAutoComplete
  }
}

declare module './types' {
  interface VfAutoCompleteProps<
    TSuggestions extends SuggestionsProp = SuggestionsProp,
    TMultiple extends boolean = false,
    TModel = any,
  >
    extends
      PartProps<VfAutoCompleteParts, VfAutoCompleteContext>,
      ClassProps<VfAutoCompleteClasses, VfAutoCompleteContext>,
      ReclassProps<VfAutoCompleteClasses, VfAutoCompleteContext> {}
}
