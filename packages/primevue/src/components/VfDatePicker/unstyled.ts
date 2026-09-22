import '#shorthands'
import VfDatePicker, { type VfDatePickerEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfDatePicker: VfDatePickerEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfDatePicker: typeof VfDatePicker
  }
}
