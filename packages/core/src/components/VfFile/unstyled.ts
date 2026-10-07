import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfFile, { type VfFileEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfFile: VfFileEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfFile: typeof VfFile
  }
}

declare module './types' {
  interface VfFileProps<TMultiple extends boolean = boolean>
    extends
      PartProps<VfFileParts, VfFileContext>,
      ClassProps<VfFileClasses, VfFileContext>,
      ReclassProps<VfFileClasses, VfFileContext> {}
}
