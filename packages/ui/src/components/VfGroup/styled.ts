import './styles'
import type { TabbedParts, TabbedSlots } from '@vueform/core'

export * from '@vueform/core/components/VfGroup'
export { default } from '@vueform/core/components/VfGroup'

declare module '@vueform/core/components/VfGroup' {
  interface VfGroupSlots extends TabbedSlots {}
  interface VfGroupParts extends TabbedParts {}
}
