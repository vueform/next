import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type {
  OptionGroupChildrenProp,
  OptionValueProp,
  OptionsProp,
} from '#src/features/options'

import VfRadioButtonGroup, { type VfRadioButtonGroupEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadioButtonGroup: VfRadioButtonGroupEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadioButtonGroup: typeof VfRadioButtonGroup
  }
}

declare module './types' {
  interface VfRadioButtonGroupProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfRadioButtonGroupParts, VfRadioButtonGroupContext>,
      ClassProps<VfRadioButtonGroupClasses, VfRadioButtonGroupContext>,
      ReclassProps<VfRadioButtonGroupClasses, VfRadioButtonGroupContext> {}
}
