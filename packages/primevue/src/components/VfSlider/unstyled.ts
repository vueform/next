import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfSlider, { type VfSliderEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSlider: VfSliderEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSlider: typeof VfSlider
  }
}

declare module './types' {
  interface VfSliderProps<TRange extends boolean = boolean>
    extends
      PartProps<VfSliderParts, VfSliderContext>,
      ClassProps<VfSliderClasses, VfSliderContext>,
      ReclassProps<VfSliderClasses, VfSliderContext> {}
}
