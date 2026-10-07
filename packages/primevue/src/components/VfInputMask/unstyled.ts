import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '@vueform/core'

import VfInputMask, { type VfInputMaskEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputMask: VfInputMaskEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputMask: typeof VfInputMask
  }
}

declare module './types' {
  interface VfInputMaskProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfInputMaskParts, VfInputMaskContext>,
      ClassProps<VfInputMaskClasses, VfInputMaskContext>,
      ReclassProps<VfInputMaskClasses, VfInputMaskContext> {}
}
