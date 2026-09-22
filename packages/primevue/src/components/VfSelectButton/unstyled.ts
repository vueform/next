import '#shorthands'
import VfSelectButton, { type VfSelectButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSelectButton: VfSelectButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSelectButton: typeof VfSelectButton
  }
}
