import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfButton, { type VfButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfButton: VfButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfButton: typeof VfButton
  }
}

declare module './types' {
  interface VfButtonProps
    extends
      PartProps<VfButtonParts, VfButtonContext>,
      ClassProps<VfButtonClasses, VfButtonContext>,
      ReclassProps<VfButtonClasses, VfButtonContext> {}
}
