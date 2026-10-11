import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '#src/types'

import VfText, { type VfTextEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfText: VfTextEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfText: typeof VfText
  }
}

declare module './types' {
  interface VfTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfTextParts, VfTextContext>,
      ClassProps<VfTextClasses, VfTextContext>,
      ReclassProps<VfTextClasses, VfTextContext> {}
}
