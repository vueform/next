<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import type { Ref, WritableComputedRef } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/toggle-switch'
import { vdomPrime } from '#src/helpers'

import type {
  VfToggleSwitchEmits,
  VfToggleSwitchProps,
  VfToggleSwitchSlots,
} from './types'

const ToggleSwitch = vdomPrime(PrimeToggleSwitch)

defineOptions({
  name: 'VfToggleSwitch',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfToggleSwitchEmits<TTrueValue, TFalseValue>>()

const props = withDefaults(
  defineProps<VfToggleSwitchProps<TTrueValue, TFalseValue>>(),
  defaults
)
const events = defineEvents<VfToggleSwitchEmits<TTrueValue, TFalseValue>>()
const slots = defineSlots<VfToggleSwitchSlots<TTrueValue, TFalseValue>>()

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
  root: 'vf-toggle-switch',
  handle: {
    'vf-toggle-switch-handle': true,
    [api.onIcon.value!]: api.checked.value && api.onIcon.value,
    [api.offIcon.value!]: !api.checked.value && api.offIcon.value,
  },
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

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

const {
  value,
  name,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  input,
  forwardProps,
  forwardSlots,
  handleInput,
  handleBlur,
  handleFocus,
} = api

/**
 * PrimeVue ToggleSwitch types `modelValue` as `string | boolean`. The element's
 * `value` is `TTrueValue | TFalseValue`, which is the same runtime binding as
 * before — this assertion is type-only.
 */
const inputValue = value as WritableComputedRef<string | boolean>

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <ToggleSwitch
        :name
        v-model="inputValue"
        :input-id="id"
        :true-value
        :false-value
        :disabled
        :readonly
        :invalid
        v-bind="{ ...forwardProps, ...bindings.input }"
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
        <template #handle="scope">
          <slot name="handle" v-bind="scope" :bindings="bindings.handle">
            <component
              v-if="outlets.handle"
              :is="outlets.handle"
              v-bind="scope"
              :bindings="bindings.handle"
            />
            <template v-else>
              <i v-bind="bindings.handle" />
            </template>
          </slot>
        </template>
      </ToggleSwitch>
    </VfLayout>
  </slot>
</template>
