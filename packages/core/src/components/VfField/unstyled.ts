import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '#src/types'

import VfField, { type VfFieldEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfField: VfFieldEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfField: typeof VfField
  }
}

declare module './types' {
  interface VfFieldProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
    TNullValue = any,
  >
    extends
      PartProps<VfFieldParts, VfFieldContext>,
      ClassProps<VfFieldClasses, VfFieldContext>,
      ReclassProps<VfFieldClasses, VfFieldContext> {}
}
