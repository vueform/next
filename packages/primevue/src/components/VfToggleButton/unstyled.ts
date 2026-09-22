import '#shorthands'
import VfToggleButton, { type VfToggleButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfToggleButton: VfToggleButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfToggleButton: typeof VfToggleButton
  }
}
