import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfRating, { type VfRatingEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfRating: VfRatingEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfRating: typeof VfRating
  }
}

declare module './types' {
  interface VfRatingProps
    extends
      PartProps<VfRatingParts, VfRatingContext>,
      ClassProps<VfRatingClasses, VfRatingContext>,
      ReclassProps<VfRatingClasses, VfRatingContext> {}
}
