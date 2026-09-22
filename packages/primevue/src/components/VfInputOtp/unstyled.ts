import '#shorthands'
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
