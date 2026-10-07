import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import type { TreeSelectionModeProp } from '#src/features/tree-options'
import type { TreeOptionsProp } from '#src/types'

import VfTreeSelect, { type VfTreeSelectEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfTreeSelect: VfTreeSelectEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfTreeSelect: typeof VfTreeSelect
  }
}

declare module './types' {
  interface VfTreeSelectProps<
    TOptions extends TreeOptionsProp = TreeOptionsProp,
    TSelectionMode extends TreeSelectionModeProp = undefined,
    TModel = any,
  >
    extends
      PartProps<VfTreeSelectParts, VfTreeSelectContext>,
      ClassProps<VfTreeSelectClasses, VfTreeSelectContext>,
      ReclassProps<VfTreeSelectClasses, VfTreeSelectContext> {}
}
