import type { ClassProps, PartProps, ReclassProps } from '@vueform/core'

import VfInputOtp, { type VfInputOtpEntry } from './index'

export * from './index'
export { default } from './index'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry> {
    VfInputOtp: VfInputOtpEntry<TEntry>
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfInputOtp: typeof VfInputOtp
  }
}

declare module './types' {
  interface VfInputOtpProps
    extends
      PartProps<VfInputOtpParts, VfInputOtpContext>,
      ClassProps<VfInputOtpClasses, VfInputOtpContext>,
      ReclassProps<VfInputOtpClasses, VfInputOtpContext> {}
}
