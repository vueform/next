import type { GroupChildrenProp, ItemValueProp, ItemsProp } from '#src/features'
import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfRadios, { type VfRadiosEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRadios: VfRadiosEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRadios: typeof VfRadios
  }
}

declare module './types' {
  interface VfRadiosProps<
    TItems extends ItemsProp = ItemsProp,
    TItemValueKey extends ItemValueProp = undefined,
    TGroupChildren extends GroupChildrenProp = undefined,
    TModel = any,
    TItemValueReturn = unknown,
  >
    extends
      PartProps<VfRadiosParts, VfRadiosContext>,
      ClassProps<VfRadiosClasses, VfRadiosContext>,
      ReclassProps<VfRadiosClasses, VfRadiosContext> {}
}
