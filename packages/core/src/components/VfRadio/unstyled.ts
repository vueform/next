import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfRadio, { type VfRadioEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadio: VfRadioEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadio: typeof VfRadio
  }
}

declare module './types' {
  interface VfRadioProps<TRadioValue = any>
    extends
      PartProps<VfRadioParts, VfRadioContext>,
      ClassProps<VfRadioClasses, VfRadioContext>,
      ReclassProps<VfRadioClasses, VfRadioContext> {}
}
