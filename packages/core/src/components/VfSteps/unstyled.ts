import '#shorthands'
import VfSteps, { type VfStepsEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ComponentRegistry<TEntry> {
    VfSteps: VfStepsEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfSteps: typeof VfSteps
  }
}
