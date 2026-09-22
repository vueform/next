import '#shorthands'
import VfContent, { type VfContentEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfContent: VfContentEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfContent: typeof VfContent
  }
}
