import '#shorthands'
import VfPassword, { type VfPasswordEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfPassword: VfPasswordEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfPassword: typeof VfPassword
  }
}
