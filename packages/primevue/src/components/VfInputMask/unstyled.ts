import '#shorthands'
import VfInputMask, { type VfInputMaskEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputMask: VfInputMaskEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputMask: typeof VfInputMask
  }
}
