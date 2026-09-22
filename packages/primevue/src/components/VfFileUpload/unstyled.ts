import '#shorthands'
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
