import '#shorthands'
import VfToggleSwitch, { type VfToggleSwitchEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfToggleSwitch: VfToggleSwitchEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfToggleSwitch: typeof VfToggleSwitch
  }
}
