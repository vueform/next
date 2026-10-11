import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfContent, { type VfContentEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfContent: VfContentEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfContent: typeof VfContent
  }
}

declare module './types' {
  interface VfContentProps
    extends
      PartProps<VfContentParts, VfContentContext>,
      ClassProps<VfContentClasses, VfContentContext>,
      ReclassProps<VfContentClasses, VfContentContext> {}
}
