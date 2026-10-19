<script setup lang="ts">
/**
 * Local copy of VfColorPicker of Vueform. How to customize it:
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
  type VfColorPickerEmits,
  type VfColorPickerProps,
  type VfColorPickerSlots,
} from '@vueform/primevue/components/VfColorPicker'
import PrimeColorPicker from 'primevue/colorpicker'

import '@vueform/primevue/color-picker.css'

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
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @change="(e) => handleInput(e.value, e.event)"
      />
    </VfLayout>
  </slot>
</template>
