import '#shorthands'
import VfRadioButton, { type VfRadioButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadioButton: VfRadioButtonEntry<TEntry>
    VfRadio: VfRadioButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadioButton: typeof VfRadioButton
    VfRadio: typeof VfRadioButton
  }
}
