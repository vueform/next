import '#shorthands'
import VfList, { type VfListEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ListRegistry<TEntry> {
    VfList: VfListEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfList: typeof VfList
  }
}
