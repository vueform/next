import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfGroup, { type VfGroupEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface GroupRegistry<TEntry> {
    VfGroup: VfGroupEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfGroup: typeof VfGroup
  }
}

declare module './types' {
  interface VfGroupProps
    extends
      PartProps<VfGroupParts, VfGroupContext>,
      ClassProps<VfGroupClasses, VfGroupContext>,
      ReclassProps<VfGroupClasses, VfGroupContext> {}
}
