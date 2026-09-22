import '#shorthands'
import VfElements, { type VfElementsEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfElements: VfElementsEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfElements: typeof VfElements
  }
}
