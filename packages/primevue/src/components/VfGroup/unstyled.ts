import type { TabbedClasses, TabbedParts, TabbedSlots } from '#src/features'

export * from '@vueform/core/components/VfGroup'
export { default } from '@vueform/core/components/VfGroup'

declare module '@vueform/core/components/VfGroup' {
  interface VfGroupSlots extends TabbedSlots {}
  interface VfGroupParts extends TabbedParts {}
  interface VfGroupClasses extends TabbedClasses {}
}
