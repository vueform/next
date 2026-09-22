import '#shorthands'
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
