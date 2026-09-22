import '#shorthands'
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
