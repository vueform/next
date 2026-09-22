import '#shorthands'
import VfCheckboxes, { type VfCheckboxesEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckboxes: VfCheckboxesEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckboxes: typeof VfCheckboxes
  }
}
