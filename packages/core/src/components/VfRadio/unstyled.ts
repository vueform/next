import '#shorthands'
import VfRadio, { type VfRadioEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadio: VfRadioEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadio: typeof VfRadio
  }
}
