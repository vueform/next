import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type { DatePickerSelectionModeProp } from '#src/blueprints/date-picker'

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

declare module './types' {
  interface VfDatePickerProps<
    TSelectionMode extends DatePickerSelectionModeProp =
      DatePickerSelectionModeProp,
  >
    extends
      PartProps<VfDatePickerParts, VfDatePickerContext>,
      ClassProps<VfDatePickerClasses, VfDatePickerContext>,
      ReclassProps<VfDatePickerClasses, VfDatePickerContext> {}
}
