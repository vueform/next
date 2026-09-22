import '#shorthands'
import VfLanguages, { type VfLanguagesEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfLanguages: VfLanguagesEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfLanguages: typeof VfLanguages
  }
}
