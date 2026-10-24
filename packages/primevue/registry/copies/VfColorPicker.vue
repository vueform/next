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
