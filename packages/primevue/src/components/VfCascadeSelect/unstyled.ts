import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type { OptionValueProp, OptionsProp } from '#src/features'
import type { CascadeOptionGroupChildrenProp } from '#src/features/options'

import VfCascadeSelect, { type VfCascadeSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCascadeSelect: VfCascadeSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCascadeSelect: typeof VfCascadeSelect
  }
}

declare module './types' {
  interface VfCascadeSelectProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfCascadeSelectParts, VfCascadeSelectContext>,
      ClassProps<VfCascadeSelectClasses, VfCascadeSelectContext>,
      ReclassProps<VfCascadeSelectClasses, VfCascadeSelectContext> {}
}
