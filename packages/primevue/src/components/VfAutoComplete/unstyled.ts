import '#shorthands'
import VfAutoComplete, { type VfAutoCompleteEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfAutoComplete: VfAutoCompleteEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfAutoComplete: typeof VfAutoComplete
  }
}
