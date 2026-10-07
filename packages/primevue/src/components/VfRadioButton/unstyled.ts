import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfRadioButton, { type VfRadioButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadioButton: VfRadioButtonEntry<TEntry>
    VfRadio: VfRadioButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadioButton: typeof VfRadioButton
    VfRadio: typeof VfRadioButton
  }
}

declare module './types' {
  interface VfRadioButtonProps<TRadioValue = any>
    extends
      PartProps<VfRadioButtonParts, VfRadioButtonContext>,
      ClassProps<VfRadioButtonClasses, VfRadioButtonContext>,
      ReclassProps<VfRadioButtonClasses, VfRadioButtonContext> {}
}
