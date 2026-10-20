<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeToggleButton from 'primevue/togglebutton'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/toggle-button'
import { vdomPrime } from '#src/helpers'

import type {
  VfToggleButtonEmits,
  VfToggleButtonProps,
  VfToggleButtonSlots,
} from './types'

const ToggleButton = vdomPrime(PrimeToggleButton)

defineOptions({
  name: 'VfToggleButton',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfToggleButtonEmits>()

const props = withDefaults(defineProps<VfToggleButtonProps>(), defaults)
const events = defineEvents<VfToggleButtonEmits>()
const slots = defineSlots<VfToggleButtonSlots>()

const { api, context, expose, outlets, useClasses, useBindings } = useBlueprint(
  blueprint,
  props,
  events,
  slots
)

const classes = useClasses({
  root: 'vf-toggle-button',
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
  onLabel,
  offLabel,
  onIcon,
  offIcon,
  forwardProps,
  forwardSlots,
  handleInput,
  handleBlur,
  handleFocus,
} = api

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <ToggleButton
        :name
        v-model="value"
        :disabled
        :readonly
        :invalid
        :on-label
        :off-label
        :on-icon
        :off-icon
        :class="classes.input"
        v-bind="{ ...forwardProps, ...bindings.input() }"
        :ref="(el) => (inputRef = el)"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleInput"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </ToggleButton>
    </VfLayout>
  </slot>
</template>
