import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfToggleButton, { type VfToggleButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfToggleButton: VfToggleButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfToggleButton: typeof VfToggleButton
  }
}

declare module './types' {
  interface VfToggleButtonProps
    extends
      PartProps<VfToggleButtonParts, VfToggleButtonContext>,
      ClassProps<VfToggleButtonClasses, VfToggleButtonContext>,
      ReclassProps<VfToggleButtonClasses, VfToggleButtonContext> {}
}
