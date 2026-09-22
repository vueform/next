import '#shorthands'
import VfCheckboxGroup, { type VfCheckboxGroupEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckboxGroup: VfCheckboxGroupEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckboxGroup: typeof VfCheckboxGroup
  }
}
