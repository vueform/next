import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfInputNumber, { type VfInputNumberEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputNumber: VfInputNumberEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputNumber: typeof VfInputNumber
  }
}

declare module './types' {
  interface VfInputNumberProps
    extends
      PartProps<VfInputNumberParts, VfInputNumberContext>,
      ClassProps<VfInputNumberClasses, VfInputNumberContext>,
      ReclassProps<VfInputNumberClasses, VfInputNumberContext> {}
}
