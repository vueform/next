import '#shorthands'
import VfColorPicker, { type VfColorPickerEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfColorPicker: VfColorPickerEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfColorPicker: typeof VfColorPicker
  }
}
