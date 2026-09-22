import '#shorthands'
import VfTreeSelect, { type VfTreeSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfTreeSelect: VfTreeSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTreeSelect: typeof VfTreeSelect
  }
}
