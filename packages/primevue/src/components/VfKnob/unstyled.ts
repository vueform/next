import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfKnob, { type VfKnobEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfKnob: VfKnobEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfKnob: typeof VfKnob
  }
}

declare module './types' {
  interface VfKnobProps
    extends
      PartProps<VfKnobParts, VfKnobContext>,
      ClassProps<VfKnobClasses, VfKnobContext>,
      ReclassProps<VfKnobClasses, VfKnobContext> {}
}
