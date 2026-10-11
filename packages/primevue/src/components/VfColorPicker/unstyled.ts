import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

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

declare module './types' {
  interface VfColorPickerProps
    extends
      PartProps<VfColorPickerParts, VfColorPickerContext>,
      ClassProps<VfColorPickerClasses, VfColorPickerContext>,
      ReclassProps<VfColorPickerClasses, VfColorPickerContext> {}
}
