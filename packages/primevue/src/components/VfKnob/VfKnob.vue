<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeKnob from 'primevue/knob'
import type { WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/knob'
import { vdomPrime } from '#src/helpers'

import type { VfKnobEmits, VfKnobProps, VfKnobSlots } from './types'

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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: () => ({
    'vf-knob': true,
    'vf-centered': !!props.centered,
  }),
})

const bindings = useBindings(
  {
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

const {
  value,
  name,
  disabled,
  readonly,
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
        v-model="inputValue"
        :disabled
        :readonly
        :invalid
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
