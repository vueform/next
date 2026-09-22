import '#shorthands'
import VfForm, { type VfFormEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfForm: VfFormEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfForm: typeof VfForm
  }
}
