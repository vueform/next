import '#shorthands'
import VfInputText, { type VfInputTextEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputText: VfInputTextEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputText: typeof VfInputText
  }
}
