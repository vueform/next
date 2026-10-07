import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type LanguagesProp,
} from '@vueform/core'

import VfEditor, { type VfEditorEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfEditor: VfEditorEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfEditor: typeof VfEditor
  }
}

declare module './types' {
  interface VfEditorProps<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  >
    extends
      PartProps<VfEditorParts, VfEditorContext>,
      ClassProps<VfEditorClasses, VfEditorContext>,
      ReclassProps<VfEditorClasses, VfEditorContext> {}
}
