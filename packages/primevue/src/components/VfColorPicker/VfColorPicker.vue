<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeColorPicker from 'primevue/colorpicker'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/color-picker'
import { vdomPrime } from '#src/helpers'

import type {
  VfColorPickerEmits,
  VfColorPickerProps,
  VfColorPickerSlots,
} from './types'

const PvColorPicker = vdomPrime(PrimeColorPicker)

defineOptions({
  name: 'VfColorPicker',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfColorPickerEmits>()

const props = withDefaults(defineProps<VfColorPickerProps>(), defaults)
const events = defineEvents<VfColorPickerEmits>()
const slots = defineSlots<VfColorPickerSlots>()

const {
  api,
  context,
  expose,
  outlets,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-color-picker',
}))

useModifiers(({ hasError, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const {
  value,
  name,
  disabled,
  invalid,
  id,
  viewLoaded,
  input,
  format,
  forwardProps,
  handleInput,
} = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <PvColorPicker
        :name
        v-model="value"
        :input-id="id"
        :format
        :disabled
        :invalid
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (input = el)"
        @change="(e) => handleInput(e.value, e.event)"
      />
    </VfLayout>
  </slot>
</template>
