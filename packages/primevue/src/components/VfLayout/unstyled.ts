import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfLayout, { type VfLayoutEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfLayout: VfLayoutEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfLayout: typeof VfLayout
  }
}

declare module './types' {
  interface VfLayoutProps
    extends
      PartProps<VfLayoutParts, VfLayoutContext>,
      ClassProps<VfLayoutClasses, VfLayoutContext>,
      ReclassProps<VfLayoutClasses, VfLayoutContext> {}
}
