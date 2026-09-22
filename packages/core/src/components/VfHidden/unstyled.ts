import '#shorthands'
import VfHidden, { type VfHiddenEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfHidden: VfHiddenEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfHidden: typeof VfHidden
  }
}
