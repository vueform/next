<script setup lang="ts" generic="const TRange extends boolean = false">
/**
 * VfCloneName — a custom element created from Vueform's `slider` blueprint.
 *
 * @see https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  vdomPrime,
  type ClassValue,
  type DefineElementContext,
  type WidenProps,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type SliderApi,
  type SliderClasses,
  type SliderEmits,
  type SliderExpose,
  type SliderParts,
  type SliderProps,
  type SliderSlots,
} from '@vueform/primevue/blueprints/slider'
import type { SliderProps as PvSliderProps } from 'primevue'
import PrimeSlider from 'primevue/slider'

import '@vueform/primevue/slider.css'
import type { WritableComputedRef } from 'vue'

/**
 * Prop definitions.
 *
 * @example
 *   custom?: any
 */
export interface VfCloneNameProps<
  TRange extends boolean = boolean,
> extends SliderProps<
  '__TYPE__',
  TRange,
  VfCloneNameSlots<TRange>,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameContext<VfCloneNameProps<TRange>>
> {}

/**
 * Emit / event definitions.
 *
 * @example
 *   custom: [arg1: any, arg2: any, context$: VfCloneNameContext]
 *
 * @see https://primevue.vueform.com/guide/event-handlers
 */
export interface VfCloneNameEmits<
  TRange extends boolean = boolean,
> extends SliderEmits<VfCloneNameContext<VfCloneNameProps<TRange>>> {}

/**
 * Slot definitions.
 *
 * @example
 *   custom: (props: { prop1: any; prop2: any }) => import('vue').VNode[]
 *
 * @see https://primevue.vueform.com/guide/slots
 */
export interface VfCloneNameSlots<
  TRange extends boolean = boolean,
> extends SliderSlots<VfCloneNameContext<VfCloneNameProps<TRange>>> {}

/**
 * Part definitions.
 *
 * @example
 *   tag: import('@vueform/primevue').DomAttrsOf<'div'>
 *   component: import('@vueform/primevue').PartOf<'VfButton'>
 *
 * @see https://primevue.vueform.com/guide/parts
 */
export interface VfCloneNameParts extends SliderParts {
  /**
   * The slider element.
   *
   * @tag Slider
   */
  input: PvSliderProps
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
export interface VfCloneNameClasses extends SliderClasses {
  /**
   * The slider element.
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
export interface VfCloneNameExpose extends SliderExpose {}

/**
 * The element's context — the object slots, outlets, and event handlers
 * receive (`context$`). Its shape is derived from the blueprint and the
 * interfaces above — customize those; don't extend or edit this one.
 */
export interface VfCloneNameContext<
  TProps extends WidenProps<VfCloneNameProps, SliderProps<string>> =
    VfCloneNameProps,
> extends DefineElementContext<
  TProps,
  VfCloneNameEmits,
  VfCloneNameSlots,
  VfCloneNameParts,
  VfCloneNameClasses,
  VfCloneNameExpose,
  SliderApi<TProps>
> {}

const Slider = vdomPrime(PrimeSlider)
defineOptions({
  name: 'VfCloneName',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCloneNameEmits<TRange>>()

const props = withDefaults(defineProps<VfCloneNameProps<TRange>>(), {
  ...defaults,
  type: '__TYPE__',
})
const events = defineEvents<VfCloneNameEmits<TRange>>()
const slots = defineSlots<VfCloneNameSlots<TRange>>()

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
const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

/**
 * The element's own classes, per part — reactive via the callback's api
 * refs. The class keys come from VfCloneNameClasses above.
 *
 * @see https://primevue.vueform.com/guide/classes
 */
useClasses(() => ({
  root: 'vf-slider',
}))

const { range } = propRefs

const {
  value,
  name,
  disabled,
  invalid,
  viewLoaded,
  input,
  min,
  max,
  step,
  forwardProps,
  handleInput,
} = api

/**
 * PrimeVue Slider types `modelValue` as `number | number[]`. The element's
 * `value` is the expressionable textish model (`TextishModel` /
 * `TextishArrayModel`), which is the same runtime binding as before — this
 * assertion is type-only.
 */
const inputValue = value as WritableComputedRef<number | number[] | undefined>

defineExpose(expose)
</script>

<script lang="ts">
import type { DefineRegistryEntry, EntryPropOf } from '@vueform/primevue'

type EntryRangeOf<TEntry> =
  EntryPropOf<TEntry, 'range'> extends infer R
    ? R extends boolean
      ? R
      : false
    : false

type EntryProps<TEntry> = VfCloneNameProps<EntryRangeOf<TEntry>>

declare module '@vueform/core' {
  interface ControlRegistry<TEntry = Record<string, any>> {
    VfCloneName: DefineRegistryEntry<
      EntryProps<TEntry>,
      VfCloneNameEmits<EntryRangeOf<TEntry>>,
      VfCloneNameSlots,
      VfCloneNameParts,
      VfCloneNameClasses,
      VfCloneNameContext<EntryProps<TEntry>>
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
      <Slider
        :name
        :class="classes.input"
        v-model="inputValue"
        :disabled
        :invalid
        :range
        :min
        :max
        :step
        v-bind="{
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @change="handleInput"
      />
    </VfLayout>
  </slot>
</template>
