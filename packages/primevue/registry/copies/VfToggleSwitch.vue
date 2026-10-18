<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * Local copy of VfToggleSwitch of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfToggleSwitchEmits,
  type VfToggleSwitchProps,
  type VfToggleSwitchSlots,
} from '@vueform/primevue/components/VfToggleSwitch'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import type { Ref, WritableComputedRef } from 'vue'

import '@vueform/primevue/toggle-switch.css'

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

useClasses(() => ({
  root: 'vf-toggle-switch',
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
  a11yBindings,
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
