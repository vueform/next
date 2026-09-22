import '#shorthands'
import VfTextarea, { type VfTextareaEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfTextarea: VfTextareaEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTextarea: typeof VfTextarea
  }
}
