<script setup lang="ts" generic="const TRadioValue = true">
/**
 * Local copy of VfRadio of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { inputAria, useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfRadioEmits,
  type VfRadioProps,
  type VfRadioSlots,
} from '@vueform/ui/components/VfRadio'
import type { Ref } from 'vue'

import '@vueform/ui/choice.css'

defineOptions({
  name: 'VfRadio',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfRadioEmits<TRadioValue>>()

const props = withDefaults(defineProps<VfRadioProps<TRadioValue>>(), defaults)
const events = defineEvents<VfRadioEmits<TRadioValue>>()
const slots = defineSlots<VfRadioSlots<TRadioValue>>()

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

const radioValue = propRefs.radioValue as Ref<TRadioValue>

const {
  value,
  id,
  disabled,
  viewLoaded,
  inputName,
  text,
  inputRef,
  genericName,
  model,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

useClasses(() => ({
  root: 'vf-radio',
  wrapper: 'vf-choice-wrapper',
  input: 'vf-choice-input',
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
        :input-ref="inputRef"
        :text
        :bindings="bindings.wrapper"
        :handle-blur
        :handle-focus
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
          :input-ref="inputRef"
          :text
          :bindings="bindings.wrapper"
          :handle-blur
          :handle-focus
          :handle-model-update
        />
        <div v-else v-bind="bindings.wrapper">
          <input
            type="radio"
            v-model="value"
            :name="inputName"
            :value="radioValue"
            :id
            :disabled
            v-bind="bindings.input"
            :ref="(el) => (inputRef = el)"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
          />
          <slot name="text" :text :id :generic-name :bindings="bindings.text">
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :bindings="bindings.text"
            />
            <label v-else-if="text" :for="id" v-bind="bindings.text">{{
              text
            }}</label>
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
