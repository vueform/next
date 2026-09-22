<script setup lang="ts" generic="const TRange extends boolean = false">
/**
 * Local copy of VfSlider of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import PrimeSlider from 'primevue/slider'
import { blueprint, defaults } from '@vueform/primevue/blueprints/slider'
import type {
  VfSliderEmits,
  VfSliderProps,
  VfSliderSlots,
} from '@vueform/primevue/components/VfSlider'
import type { WritableComputedRef } from 'vue'
import '@vueform/primevue/slider.css'

const Slider = vdomPrime(PrimeSlider)
defineOptions({
  name: 'VfSlider',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfSliderEmits<TRange>>()

const props = withDefaults(defineProps<VfSliderProps<TRange>>(), defaults)
const events = defineEvents<VfSliderEmits<TRange>>()
const slots = defineSlots<VfSliderSlots<TRange>>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

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
