import type { GroupChildrenProp, ItemValueProp, ItemsProp } from '#src/features'
import type { ClassProps, PartProps, ReclassProps } from '#src/types'

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
    TItems extends ItemsProp = ItemsProp,
    TItemValueKey extends ItemValueProp = undefined,
    TGroupChildren extends GroupChildrenProp = undefined,
    TMultiple extends boolean = false,
    TModel = any,
    TItemValueReturn = unknown,
  >
    extends
      PartProps<VfSelectParts, VfSelectContext>,
      ClassProps<VfSelectClasses, VfSelectContext>,
      ReclassProps<VfSelectClasses, VfSelectContext> {}
}
