import type { TabsClasses, TabsParts, TabsSlots } from '#primevue/features'

export * from '@vueform/core/components/VfGroup/raw'
export { default } from '@vueform/core/components/VfGroup/raw'

declare module '@vueform/core/components/VfGroup/raw' {
  interface VfGroupSlots extends TabsSlots {}
  interface VfGroupParts extends TabsParts {}
  interface VfGroupClasses extends TabsClasses {}
}
