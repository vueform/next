import '#shorthands'
import VfNav, { type VfNavEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfNav: VfNavEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfNav: typeof VfNav
  }
}
