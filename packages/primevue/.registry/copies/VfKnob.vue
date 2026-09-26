<script setup lang="ts">
/**
 * Local copy of VfKnob of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import PrimeKnob from 'primevue/knob'
import {
  type VfKnobEmits,
  type VfKnobProps,
  type VfKnobSlots,
  blueprint,
  defaults,
} from '@vueform/primevue/components/VfKnob'
import type { WritableComputedRef } from 'vue'
import '@vueform/primevue/knob.css'

const Knob = vdomPrime(PrimeKnob)

defineOptions({
  name: 'VfKnob',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfKnobEmits>()

const props = withDefaults(defineProps<VfKnobProps>(), defaults)
const events = defineEvents<VfKnobEmits>()
const slots = defineSlots<VfKnobSlots>()

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: {
    'vf-knob': true,
    'vf-centered': !!props.centered,
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
  min,
  max,
  step,
  forwardProps,
  handleInput,
} = api

/**
 * PrimeVue Knob types `modelValue` as `number | undefined`. The element's
 * `value` is `TextishModel` (`string | number | null`), which is the same
 * runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<number | undefined>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <Knob
        :name
        :class="classes.input"
        v-model="inputValue"
        :disabled
        :readonly
        :invalid
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
