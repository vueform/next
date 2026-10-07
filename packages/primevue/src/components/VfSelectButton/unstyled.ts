import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type { OptionValueProp, OptionsProp } from '#src/features'

import VfSelectButton, { type VfSelectButtonEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfSelectButton: VfSelectButtonEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSelectButton: typeof VfSelectButton
  }
}

declare module './types' {
  interface VfSelectButtonProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TMultiple extends boolean = false,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfSelectButtonParts, VfSelectButtonContext>,
      ClassProps<VfSelectButtonClasses, VfSelectButtonContext>,
      ReclassProps<VfSelectButtonClasses, VfSelectButtonContext> {}
}
