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

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-color-picker',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
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
  invalid,
  id,
  viewLoaded,
  inputRef,
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
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
        @change="(e) => handleInput(e.value, e.event)"
      />
    </VfLayout>
  </slot>
</template>
