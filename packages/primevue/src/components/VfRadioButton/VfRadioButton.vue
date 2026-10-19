<script setup lang="ts" generic="const TRadioValue = true">
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeRadioButton from 'primevue/radiobutton'
import type { Ref } from 'vue'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/radio-button'
import { vdomPrime } from '#src/helpers'

import type {
  VfRadioButtonEmits,
  VfRadioButtonProps,
  VfRadioButtonSlots,
} from './types'

const RadioButton = vdomPrime(PrimeRadioButton)
defineOptions({
  name: 'VfRadioButton',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfRadioButtonEmits<TRadioValue>>()

const props = withDefaults(
  defineProps<VfRadioButtonProps<TRadioValue>>(),
  defaults
)
const events = defineEvents<VfRadioButtonEmits<TRadioValue>>()
const slots = defineSlots<VfRadioButtonSlots<TRadioValue>>()

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

const radioValue = propRefs.value as Ref<TRadioValue> // @todo: look into if it's possible to remove this from all comps

const {
  model,
  value,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  inputName,
  text,
  input,
  genericName,
  forwardProps,
  forwardSlots,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

useClasses(() => ({
  root: 'vf-radio-button',
  wrapper: 'vf-choice-wrapper',
  text: 'vf-choice-text',
}))

useModifiers(({ props, hasError, help }) => ({
  root: {
    'data-align-label': !help.value ? '' : undefined,
  },
  wrapper: {
    'data-align': props.align || undefined,
    'data-aligned': props.aligned ? '' : undefined,
  },
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <slot
        :model
        :value="radioValue"
        :input-name
        :id
        :disabled
        :input
        :text
        :bindings="bindings.wrapper"
        :handle-blur
        :handle-focus
        :handle-input
        :handle-model-update
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :value="radioValue"
          :input-name
          :id
          :disabled
          :input
          :text
          :bindings="bindings.wrapper"
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
        />
        <div v-else v-bind="bindings.wrapper">
          <RadioButton
            v-model="value"
            :name="inputName"
            :input-id="id"
            :value="radioValue"
            :disabled
            :readonly
            :invalid
            v-bind="{ ...bindings.input, ...forwardProps }"
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
          </RadioButton>
          <slot name="text" :text :id :generic-name :bindings="bindings.text">
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :bindings="bindings.text"
            />
            <label v-else-if="text" :for="id" v-bind="bindings.text">
              {{ text }}
            </label>
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
