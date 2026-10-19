<script setup lang="ts" generic="const TRange extends boolean = false">
/**
 * Local copy of VfSlider of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
} from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfSliderEmits,
  type VfSliderProps,
  type VfSliderSlots,
} from '@vueform/primevue/components/VfSlider'
import PrimeSlider from 'primevue/slider'
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

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-slider',
}))

useModifiers(({ hasError }) => ({
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const { range } = propRefs

const {
  value,
  name,
  disabled,
  invalid,
  viewLoaded,
  inputRef,
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
        v-model="inputValue"
        :disabled
        :invalid
        :range
        :min
        :max
        :step
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @change="handleInput"
      />
    </VfLayout>
  </slot>
</template>
