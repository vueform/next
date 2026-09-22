import '#shorthands'
import VfCascadeSelect, { type VfCascadeSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCascadeSelect: VfCascadeSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCascadeSelect: typeof VfCascadeSelect
  }
}
