import '#shorthands'
import VfLayout, { type VfLayoutEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfLayout: VfLayoutEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfLayout: typeof VfLayout
  }
}
