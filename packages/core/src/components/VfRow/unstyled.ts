import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfRow, { type VfRowEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfRow: VfRowEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRow: typeof VfRow
  }
}

declare module './types' {
  interface VfRowProps
    extends
      PartProps<VfRowParts, VfRowContext>,
      ClassProps<VfRowClasses, VfRowContext>,
      ReclassProps<VfRowClasses, VfRowContext> {}
}
