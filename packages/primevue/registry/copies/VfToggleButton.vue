<script setup lang="ts">
/**
 * Local copy of VfToggleButton of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfToggleButtonEmits,
  type VfToggleButtonProps,
  type VfToggleButtonSlots,
} from '@vueform/primevue/components/VfToggleButton'
import PrimeToggleButton from 'primevue/togglebutton'

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

useClasses(() => ({
  root: 'vf-toggle-button',
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
  a11yBindings,
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
          ...a11yBindings.input,
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
