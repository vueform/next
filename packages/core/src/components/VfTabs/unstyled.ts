import '#shorthands'
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
