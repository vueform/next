<script setup lang="ts">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeInputNumber from 'primevue/inputnumber'
import type { WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/input-number'
import { vdomPrime } from '#src/helpers'

import type {
  VfInputNumberEmits,
  VfInputNumberProps,
  VfInputNumberSlots,
} from './types'

const InputNumber = vdomPrime(PrimeInputNumber)
defineOptions({
  name: 'VfInputNumber',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfInputNumberEmits>()

const props = withDefaults(defineProps<VfInputNumberProps>(), defaults)
const events = defineEvents<VfInputNumberEmits>()
const slots = defineSlots<VfInputNumberSlots>()

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
  root: 'vf-text-number',
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

const {
  value,
  id,
  readonly,
  placeholder,
  viewLoaded,
  disabled,
  inputRef,
  name,
  tooltipModifiers,
  tooltipValue,
  invalid,
  min,
  max,
  step,
  currency,
  locale,
  prefix,
  suffix,
  mode,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur: onBlur,
} = api

/**
 * PrimeVue InputNumber types `modelValue` as `number | null`. The element's
 * `value` is `TextishModel` (`string | number | string[] | null`), which is the
 * same runtime binding as before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<number | null>

// @todo
const handleBlur = (event: { originalEvent: Event; value: string }) => {
  onBlur(event.originalEvent)
}

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <InputNumber
        :name
        :input-id="id"
        v-model="inputValue"
        :placeholder
        :disabled
        :readonly
        :invalid
        :min
        :max
        :step
        :currency
        :locale
        :prefix
        :suffix
        :mode
        fluid
        v-tooltip:[tooltipModifiers]="tooltipValue"
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="(e) => handleInput(e.value ?? null, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </InputNumber>
    </VfLayout>
  </slot>
</template>
