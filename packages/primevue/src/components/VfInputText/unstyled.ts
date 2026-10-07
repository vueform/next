import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '@vueform/core'

import VfInputText, { type VfInputTextEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputText: VfInputTextEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputText: typeof VfInputText
  }
}

declare module './types' {
  interface VfInputTextProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfInputTextParts, VfInputTextContext>,
      ClassProps<VfInputTextClasses, VfInputTextContext>,
      ReclassProps<VfInputTextClasses, VfInputTextContext> {}
}
