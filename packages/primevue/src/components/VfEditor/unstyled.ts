import '#shorthands'
import VfEditor, { type VfEditorEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfEditor: VfEditorEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfEditor: typeof VfEditor
  }
}
