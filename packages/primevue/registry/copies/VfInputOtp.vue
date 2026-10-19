<script setup lang="ts">
/**
 * Local copy of VfInputOtp of Vueform. How to customize it:
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
  type VfInputOtpEmits,
  type VfInputOtpProps,
  type VfInputOtpSlots,
} from '@vueform/primevue/components/VfInputOtp'
import PrimeInputOtp from 'primevue/inputotp'
import type { WritableComputedRef } from 'vue'

const InputOtp = vdomPrime(PrimeInputOtp)

defineOptions({
  name: 'VfInputOtp',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfInputOtpEmits>()

const props = withDefaults(defineProps<VfInputOtpProps>(), defaults)
const events = defineEvents<VfInputOtpEmits>()
const slots = defineSlots<VfInputOtpSlots>()

const {
  api,
  context,
  expose,
  outlets,
  propRefs,
  bindings,
  useClasses,
  useModifiers,
  useA11y,
} = useBlueprint(blueprint, props, events, slots)

useClasses(() => ({
  root: 'vf-input-otp',
}))

useModifiers(({ help, hasError }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const { length } = propRefs

const {
  value,
  viewLoaded,
  disabled,
  readonly,
  inputRef,
  tooltipModifiers,
  tooltipValue,
  invalid,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

/**
 * PrimeVue InputOtp types `modelValue` as `string | boolean | undefined`. The
 * element's `value` is `string | null`, which is the same runtime binding as
 * before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | boolean | undefined>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <InputOtp
        v-model="inputValue"
        :disabled
        :readonly
        :invalid
        :length
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="(e) => handleInput(e.value, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </InputOtp>
    </VfLayout>
  </slot>
</template>
