import type { ClassProps, PartProps, ReclassProps } from '#src/types'

import VfMatrix, { type VfMatrixEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface MatrixRegistry<TEntry> {
    VfMatrix: VfMatrixEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfMatrix: typeof VfMatrix
  }
}

declare module './types' {
  interface VfMatrixProps
    extends
      PartProps<VfMatrixParts, VfMatrixContext>,
      ClassProps<VfMatrixClasses, VfMatrixContext>,
      ReclassProps<VfMatrixClasses, VfMatrixContext> {}
}
