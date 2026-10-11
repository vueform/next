import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfAddon, { type VfAddonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfAddon: VfAddonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfAddon: typeof VfAddon
  }
}

declare module './types' {
  interface VfAddonProps
    extends
      PartProps<VfAddonParts, VfAddonContext>,
      ClassProps<VfAddonClasses, VfAddonContext>,
      ReclassProps<VfAddonClasses, VfAddonContext> {}
}
