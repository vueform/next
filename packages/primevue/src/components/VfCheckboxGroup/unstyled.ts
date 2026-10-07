import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type {
  OptionGroupChildrenProp,
  OptionValueProp,
  OptionsProp,
} from '#src/features/options'

import VfCheckboxGroup, { type VfCheckboxGroupEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckboxGroup: VfCheckboxGroupEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckboxGroup: typeof VfCheckboxGroup
  }
}

declare module './types' {
  interface VfCheckboxGroupProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfCheckboxGroupParts, VfCheckboxGroupContext>,
      ClassProps<VfCheckboxGroupClasses, VfCheckboxGroupContext>,
      ReclassProps<VfCheckboxGroupClasses, VfCheckboxGroupContext> {}
}
