import '#shorthands'
import VfListbox, { type VfListboxEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfListbox: VfListboxEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfListbox: typeof VfListbox
  }
}
