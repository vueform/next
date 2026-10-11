import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type {
  OptionGroupChildrenProp,
  OptionValueProp,
  OptionsProp,
} from '#src/features'

import VfListbox, { type VfListboxEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfListbox: VfListboxEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfListbox: typeof VfListbox
  }
}

declare module './types' {
  interface VfListboxProps<
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TGroupChildren extends OptionGroupChildrenProp = undefined,
    TMultiple extends boolean = false,
    TModel = any,
    TOptionValueReturn = unknown,
  >
    extends
      PartProps<VfListboxParts, VfListboxContext>,
      ClassProps<VfListboxClasses, VfListboxContext>,
      ReclassProps<VfListboxClasses, VfListboxContext> {}
}
