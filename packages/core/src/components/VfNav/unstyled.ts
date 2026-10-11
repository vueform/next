import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfNav, { type VfNavEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfNav: VfNavEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfNav: typeof VfNav
  }
}

declare module './types' {
  interface VfNavProps
    extends
      PartProps<VfNavParts, VfNavContext>,
      ClassProps<VfNavClasses, VfNavContext>,
      ReclassProps<VfNavClasses, VfNavContext> {}
}
