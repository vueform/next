import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfTabs, { type VfTabsEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfTabs: VfTabsEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTabs: typeof VfTabs
  }
}

declare module './types' {
  interface VfTabsProps
    extends
      PartProps<VfTabsParts, VfTabsContext>,
      ClassProps<VfTabsClasses, VfTabsContext>,
      ReclassProps<VfTabsClasses, VfTabsContext> {}
}
