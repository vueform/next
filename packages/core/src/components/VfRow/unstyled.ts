import '#shorthands'
import VfRow, { type VfRowEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfRow: VfRowEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRow: typeof VfRow
  }
}
