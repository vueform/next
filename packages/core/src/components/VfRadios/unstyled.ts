import '#shorthands'
import VfRadios, { type VfRadiosEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadios: VfRadiosEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadios: typeof VfRadios
  }
}
