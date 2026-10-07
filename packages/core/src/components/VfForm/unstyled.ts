import {
  type ClassProps,
  type PartProps,
  type ReclassProps,
  type FormSchema,
} from '#src/types'

import VfForm, { type VfFormEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfForm: VfFormEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfForm: typeof VfForm
  }
}

declare module './types' {
  interface VfFormProps<TSchema = FormSchema>
    extends
      PartProps<VfFormParts, VfFormContext>,
      ClassProps<VfFormClasses, VfFormContext>,
      ReclassProps<VfFormClasses, VfFormContext> {}
}
