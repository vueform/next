import type { GroupChildrenProp, ItemValueProp, ItemsProp } from '#src/features'
import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfCheckboxes, { type VfCheckboxesEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfCheckboxes: VfCheckboxesEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCheckboxes: typeof VfCheckboxes
  }
}

declare module './types' {
  interface VfCheckboxesProps<
    TItems extends ItemsProp = ItemsProp,
    TItemValueKey extends ItemValueProp = undefined,
    TGroupChildren extends GroupChildrenProp = undefined,
    TModel = any,
    TItemValueReturn = unknown,
  >
    extends
      PartProps<VfCheckboxesParts, VfCheckboxesContext>,
      ClassProps<VfCheckboxesClasses, VfCheckboxesContext>,
      ReclassProps<VfCheckboxesClasses, VfCheckboxesContext> {}
}
