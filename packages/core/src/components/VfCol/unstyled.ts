import '#shorthands'
import VfCol, { type VfColEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfCol: VfColEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCol: typeof VfCol
  }
}
