import '#shorthands'
import VfRadioButtonGroup, { type VfRadioButtonGroupEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadioButtonGroup: VfRadioButtonGroupEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadioButtonGroup: typeof VfRadioButtonGroup
  }
}
