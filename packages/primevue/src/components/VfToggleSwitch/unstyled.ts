import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfToggleSwitch, { type VfToggleSwitchEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfToggleSwitch: VfToggleSwitchEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfToggleSwitch: typeof VfToggleSwitch
  }
}

declare module './types' {
  interface VfToggleSwitchProps<TTrueValue = true, TFalseValue = false>
    extends
      PartProps<VfToggleSwitchParts, VfToggleSwitchContext>,
      ClassProps<VfToggleSwitchClasses, VfToggleSwitchContext>,
      ReclassProps<VfToggleSwitchClasses, VfToggleSwitchContext> {}
}
