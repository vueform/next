import '#shorthands'
import VfGrid, { type VfGridEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface GridRegistry<TEntry> {
    VfGrid: VfGridEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfGrid: typeof VfGrid
  }
}
