<script setup lang="ts">
/**
 * VfCloneName — a custom element created from Vueform's `toggle-button` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type ForwardedSlots,
} from '@vueform/primevue'
import PrimeToggleButton, {
  type ToggleButtonSlots as AToggleButtonSlots,
} from 'primevue/togglebutton'
import {
  blueprint,
  defaults,
  type ToggleButtonApi,
  type ToggleButtonClasses,
  type ToggleButtonEmits,
  type ToggleButtonExpose,
  type ToggleButtonParts,
  type ToggleButtonProps,
  type ToggleButtonSlots,
  type forwards,
} from '@vueform/primevue/blueprints/toggle-button'
import type { ToggleButtonProps as PvToggleButtonProps } from 'primevue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps extends ToggleButtonProps<
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
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits extends ToggleButtonEmits<VfCloneNameContext> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots
  extends
    ToggleButtonSlots<VfCloneNameContext>,
    /* @vue-ignore */ ForwardedSlots<
      AToggleButtonSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends ToggleButtonParts {
  /**
   * The toggle button element.
   *
   * @tag ToggleButton
   */
  input: PvToggleButtonProps
}

/**
 * Class definitions.
 *
 * @example
 *   plain: import('@vueform/primevue').ClassValue
 *   dynamic: (arg1: any, arg2: any) => import('@vueform/primevue').ClassValue
 *
 * @see https://primevue.vueform.com/guide/classes
 */
export interface VfCloneNameClasses extends ToggleButtonClasses {
  /**
   * The toggle button element.
   */
  input: ClassValue
}

/**
 * Custom exposed API members. Add props you return from useBlueprint's
 * 5th 'extend' callback.
 *
 * @example
 *   plain: string
 *   vueRef: import('vue').Ref<string>
 *   method: (arg1: any, arg2: any) => string
 *
 * @see https://primevue.vueform.com/guide/components#expose-interface
 */
export interface VfCloneNameExpose extends ToggleButtonExpose {}

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
  ToggleButtonApi
> {}

const ToggleButton = vdomPrime(PrimeToggleButton)

defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
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
 * @see https://primevue.vueform.com/guide/components#extending-the-logic
 */
const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(({ help }) => ({
  root: {
    'vf-toggle-button': true,
    'vf-align-label': !help.value,
  },
}))

const {
  value,
  name,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  input,
  onLabel,
  offLabel,
  onIcon,
  offIcon,
  forwardProps,
  forwardSlots,
  handleInput,
  handleBlur,
  handleFocus,
} = api

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry } from '@vueform/primevue'

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
    <VfLayout v-else>
      <ToggleButton
        :name
        :class="classes.input"
        v-model="value"
        :disabled
        :readonly
        :invalid
        :on-label
        :off-label
        :on-icon
        :off-icon
        v-bind="{
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </ToggleButton>
    </VfLayout>
  </slot>
</template>
