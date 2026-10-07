import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfIcon, { type VfIconEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfIcon: VfIconEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfIcon: typeof VfIcon
  }
}

declare module './types' {
  interface VfIconProps
    extends
      PartProps<VfIconParts, VfIconContext>,
      ClassProps<VfIconClasses, VfIconContext>,
      ReclassProps<VfIconClasses, VfIconContext> {}
}
