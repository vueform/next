import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type {
  OptionGroupChildrenProp,
  OptionValueProp,
  OptionsProp,
} from '#src/features'

import VfMultiSelect, { type VfMultiSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfMultiSelect: VfMultiSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfMultiSelect: typeof VfMultiSelect
  }
}

declare module './types' {
  interface VfMultiSelectProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfMultiSelectParts, VfMultiSelectContext>,
      ClassProps<VfMultiSelectClasses, VfMultiSelectContext>,
      ReclassProps<VfMultiSelectClasses, VfMultiSelectContext> {}
}
