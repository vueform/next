<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeToggleButton from 'primevue/togglebutton'
import type {
  VfToggleButtonEmits,
  VfToggleButtonProps,
  VfToggleButtonSlots,
} from './types'
import { blueprint, defaults } from '#primevue/blueprints/toggle-button'
import { vdomPrime } from '#primevue/helpers'

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

const { api, parts, classes, context, expose, outlets, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ help }) => ({
  root: {
    'vf-toggle-button': true,
    'vf-align-label': !help.value,
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
        :class="classes.input"
        v-model="value"
        :disabled
        :readonly
        :invalid
        :on-label
        :off-label
        :on-icon
        :off-icon
        v-bind="{
          ...forwardProps,
          ...parts.input,
        }"
        :ref="(el) => (input = el)"
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
