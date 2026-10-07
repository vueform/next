import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '@vueform/core'

import VfTextarea, { type VfTextareaEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfTextarea: VfTextareaEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTextarea: typeof VfTextarea
  }
}

declare module './types' {
  interface VfTextareaProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfTextareaParts, VfTextareaContext>,
      ClassProps<VfTextareaClasses, VfTextareaContext>,
      ReclassProps<VfTextareaClasses, VfTextareaContext> {}
}
