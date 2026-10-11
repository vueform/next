import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfCol, { type VfColEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfCol: VfColEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCol: typeof VfCol
  }
}

declare module './types' {
  interface VfColProps
    extends
      PartProps<VfColParts, VfColContext>,
      ClassProps<VfColClasses, VfColContext>,
      ReclassProps<VfColClasses, VfColContext> {}
}
