<script setup lang="ts" generic="const TRadioValue = true">
/**
 * Local copy of VfRadio of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import {
  type VfRadioEmits,
  type VfRadioProps,
  type VfRadioSlots,
  defaults,
  blueprint,
} from '@vueform/ui/components/VfRadio'
import type { Ref } from 'vue'
import { useBlueprint, defineEvents } from '@vueform/ui'
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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.radioValue as Ref<TRadioValue>

const {
  value,
  id,
  disabled,
  viewLoaded,
  aria,
  inputName,
  text,
  input,
  genericName,
  model,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

useClasses(({ props, hasError }) => ({
  root: 'vf-radio',
  wrapper: {
    'vf-choice-wrapper': true,
    'vf-left': props.align === 'left',
    'vf-right': props.align === 'right',
    'vf-aligned': !!props.aligned,
  },
  input: {
    'vf-choice-input': true,
    'vf-danger': hasError.value,
  },
  text: 'vf-choice-text',
}))

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <slot
        :model
        :value="radioValue"
        :aria
        :input-name
        :id
        :disabled
        :input
        :text
        :handle-blur
        :handle-focus
        :handle-model-update
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :value="radioValue"
          :aria
          :input-name
          :id
          :disabled
          :input
          :text
          :handle-blur
          :handle-focus
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <input
            type="radio"
            v-model="value"
            :class="classes.input"
            :name="inputName"
            :value="radioValue"
            :id
            :disabled
            v-bind="{
              ...aria,
              ...parts.input,
            }"
            :ref="(el) => (input = el)"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
          />
          <slot
            name="text"
            :text
            :id
            :generic-name
            :class="classes.text"
            v-bind="parts.text"
          >
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :class="classes.text"
              v-bind="parts.text"
            />
            <label
              v-else-if="text"
              :class="classes.text"
              :for="id"
              v-bind="parts.text"
              >{{ text }}</label
            >
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
