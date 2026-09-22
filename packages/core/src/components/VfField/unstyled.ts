import '#shorthands'
import VfField, { type VfFieldEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfField: VfFieldEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfField: typeof VfField
  }
}
