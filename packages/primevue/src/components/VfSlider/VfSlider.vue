<script setup lang="ts" generic="const TRange extends boolean = false">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeSlider from 'primevue/slider'
import type { WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/slider'
import { vdomPrime } from '#src/helpers'

import type { VfSliderEmits, VfSliderProps, VfSliderSlots } from './types'

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

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
  useBlueprint(blueprint, props, events, slots)

const classes = useClasses({
  root: 'vf-slider',
})

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

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
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
        @change="handleInput"
      />
    </VfLayout>
  </slot>
</template>
