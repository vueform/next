import type { ClassProps, PartProps, ReclassProps } from '#src/types'

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

declare module './types' {
  interface VfStepsProps
    extends
      PartProps<VfStepsParts, VfStepsContext>,
      ClassProps<VfStepsClasses, VfStepsContext>,
      ReclassProps<VfStepsClasses, VfStepsContext> {}
}
