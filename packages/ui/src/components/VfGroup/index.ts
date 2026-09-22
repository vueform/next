import type { TabbedParts, TabbedSlots } from '@vueform/core'

export * from '@vueform/core/components/VfGroup/raw'
export { default } from '@vueform/core/components/VfGroup/raw'

declare module '@vueform/core/components/VfGroup/raw' {
  interface VfGroupSlots extends TabbedSlots {}
  interface VfGroupParts extends TabbedParts {}
}
