<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `hidden` blueprint.
 *
 * @see https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  defaults,
  blueprint,
  type HiddenApi,
  type HiddenClasses,
  type HiddenEmits,
  type HiddenExpose,
  type HiddenParts,
  type HiddenProps,
  type HiddenSlots,
} from '@vueform/ui/blueprints/hidden'
import {
  useBlueprint,
  defineEvents,
  type DefineElementContext,
} from '@vueform/ui'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends HiddenProps<
  '__TYPE__',
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://ui.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends HiddenEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://ui.vueform.com/guide/slots
 */
export interface VfCloneNameSlots extends HiddenSlots<VfCloneNameContext> {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/ui').DomAttrsOf<'div'>
 *   component: import('@vueform/ui').PartOf<'VfButton'>
 *
 * @see https://ui.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends HiddenParts {}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/ui').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/ui').ClassValue
 *
 * @see https://ui.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends HiddenClasses {}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://ui.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends HiddenExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext extends DefineElementContext<
  VfCloneNameProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  HiddenApi
> {}

defineOptions({ name: 'VfCloneName', element: true, inheritAttrs: false })
defineEmits<VfCloneNameEmits>()

const props = withDefaults(defineProps<VfCloneNameProps>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits>()
const slots = defineSlots<VfCloneNameSlots>()

/**
 * Extend the element's API by passing a 5th 'extend' callback to
 * useBlueprint — whatever it returns merges into the api / expose
 * (declare the members on VfCloneNameExpose above).
 *
 * @example
 *   useBlueprint(blueprint, props, events, slots, () => ({
 *     plain: '',
 *     vueRef: ref(''),
 *     method: (arg1: any, arg2: any) => '',
 *   }))
 *
 * @see https://ui.vueform.com/guide/components#extending-the-logic
 */
const { api, context, expose, outlets, propRefs } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const { meta } = propRefs
const { viewLoaded, name, id, visible, inputValue } = api

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry } from '@vueform/ui'

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      VfCloneNameProps,
      VfCloneNameEmits,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext
    >
  }
}

declare module 'vue' {
  interface GlobalComponents {
    VfCloneName: (typeof import('./VfCloneName.vue'))['default']
  }
}
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <input
      v-else-if="!meta"
      v-show="visible"
      type="hidden"
      :name
      :id
      :value="inputValue"
    />
  </slot>
</template>
