import '#shorthands'
import VfCheckbox, { type VfCheckboxEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckbox: VfCheckboxEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckbox: typeof VfCheckbox
  }
}
