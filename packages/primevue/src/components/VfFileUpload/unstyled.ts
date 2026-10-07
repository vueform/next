import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfFileUpload, { type VfFileUploadEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfFileUpload: VfFileUploadEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfFileUpload: typeof VfFileUpload
  }
}

declare module './types' {
  interface VfFileUploadProps<TMultiple extends boolean = boolean>
    extends
      PartProps<VfFileUploadParts, VfFileUploadContext>,
      ClassProps<VfFileUploadClasses, VfFileUploadContext>,
      ReclassProps<VfFileUploadClasses, VfFileUploadContext> {}
}
