import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type {
  OptionGroupChildrenProp,
  OptionValueProp,
  OptionsProp,
} from '#src/features'

import VfSelect, { type VfSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSelect: VfSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSelect: typeof VfSelect
  }
}

declare module './types' {
  interface VfSelectProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TMultiple extends boolean = false,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfSelectParts, VfSelectContext>,
      ClassProps<VfSelectClasses, VfSelectContext>,
      ReclassProps<VfSelectClasses, VfSelectContext> {}
}
