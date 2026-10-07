import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfList, { type VfListEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ListRegistry<TEntry> {
    VfList: VfListEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfList: typeof VfList
  }
}

declare module './types' {
  interface VfListProps
    extends
      PartProps<VfListParts, VfListContext>,
      ClassProps<VfListClasses, VfListContext>,
      ReclassProps<VfListClasses, VfListContext> {}
}
