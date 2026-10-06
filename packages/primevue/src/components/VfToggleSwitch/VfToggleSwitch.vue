<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import type { Ref, WritableComputedRef } from 'vue'

import { blueprint, defaults } from '#primevue/blueprints/toggle-switch'
import { vdomPrime } from '#primevue/helpers'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: {
    'vf-toggle-switch': true,
    'vf-aligned': !!props.aligned,
  },
  handle: {
    'vf-toggle-switch-handle': true,
    [api.onIcon.value!]: api.checked.value && api.onIcon.value,
    [api.offIcon.value!]: !api.checked.value && api.offIcon.value,
  },
}))

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
        :class="classes.input"
        v-model="inputValue"
        :input-id="id"
        :true-value
        :false-value
        :disabled
        :readonly
        :invalid
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
        <template #handle="scope">
          <slot name="handle" v-bind="scope">
            <component
              v-if="outlets.handle"
              :is="outlets.handle"
              v-bind="scope"
            />
            <template v-else>
              <i :class="classes.handle" />
            </template>
          </slot>
        </template>
      </ToggleSwitch>
    </VfLayout>
  </slot>
</template>
