import '#shorthands'
import VfSelect, { type VfSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSelect: VfSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSelect: typeof VfSelect
  }
}
