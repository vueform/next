import '#shorthands'
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
