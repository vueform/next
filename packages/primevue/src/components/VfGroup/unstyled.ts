import type { TabsClasses, TabsParts, TabsSlots } from '#primevue/features'

export * from '@vueform/core/components/VfGroup'
export { default } from '@vueform/core/components/VfGroup'

declare module '@vueform/core/components/VfGroup' {
  interface VfGroupSlots extends TabsSlots {}
  interface VfGroupParts extends TabsParts {}
  interface VfGroupClasses extends TabsClasses {}
}
