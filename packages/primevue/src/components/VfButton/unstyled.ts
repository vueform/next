import '#shorthands'
import VfButton, { type VfButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfButton: VfButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfButton: typeof VfButton
  }
}
