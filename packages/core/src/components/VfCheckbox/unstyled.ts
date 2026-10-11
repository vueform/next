import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfCheckbox, { type VfCheckboxEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckbox: VfCheckboxEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckbox: typeof VfCheckbox
  }
}

declare module './types' {
  interface VfCheckboxProps<TTrueValue = any, TFalseValue = any>
    extends
      PartProps<VfCheckboxParts, VfCheckboxContext>,
      ClassProps<VfCheckboxClasses, VfCheckboxContext>,
      ReclassProps<VfCheckboxClasses, VfCheckboxContext> {}
}
