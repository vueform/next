<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeColorPicker from 'primevue/colorpicker'
import type {
  VfColorPickerEmits,
  VfColorPickerProps,
  VfColorPickerSlots,
} from './types'
import { blueprint, defaults } from '#primevue/blueprints/color-picker'
import { vdomPrime } from '#primevue/helpers'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: {
    'vf-color-picker': true,
    'vf-aligned': !!props.aligned,
  },
}))

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
        :class="classes.input"
        v-model="value"
        :input-id="id"
        :format
        :disabled
        :invalid
        v-bind="{
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
        @change="(e) => handleInput(e.value, e.event)"
      />
    </VfLayout>
  </slot>
</template>
