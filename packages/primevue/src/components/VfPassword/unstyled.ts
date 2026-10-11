import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '@vueform/core'

import VfPassword, { type VfPasswordEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfPassword: VfPasswordEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfPassword: typeof VfPassword
  }
}

declare module './types' {
  interface VfPasswordProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfPasswordParts, VfPasswordContext>,
      ClassProps<VfPasswordClasses, VfPasswordContext>,
      ReclassProps<VfPasswordClasses, VfPasswordContext> {}
}
