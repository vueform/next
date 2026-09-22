import '#shorthands'
import VfText, { type VfTextEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfText: VfTextEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfText: typeof VfText
  }
}
