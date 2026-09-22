import '#shorthands'
import VfMultiSelect, { type VfMultiSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfMultiSelect: VfMultiSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfMultiSelect: typeof VfMultiSelect
  }
}
