<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * Local copy of VfCheckbox of Vueform. How to customize it:
 * https://ui.vueform.com/guide/components#building-on-blueprints
 */

import { inputAria, useBlueprint, defineEvents } from '@vueform/ui'
import {
  defaults,
  blueprint,
  type VfCheckboxEmits,
  type VfCheckboxProps,
  type VfCheckboxSlots,
} from '@vueform/ui/components/VfCheckbox'
import type { Ref } from 'vue'

import '@vueform/ui/choice.css'

defineOptions({
  name: 'VfCheckbox',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => props.falseValue ?? false,
})
defineEmits<VfCheckboxEmits<TTrueValue, TFalseValue>>()

const props = withDefaults(
  defineProps<VfCheckboxProps<TTrueValue, TFalseValue>>(),
  defaults
)
const events = defineEvents<VfCheckboxEmits<TTrueValue, TFalseValue>>()
const slots = defineSlots<VfCheckboxSlots<TTrueValue, TFalseValue>>()

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

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

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
  root: 'vf-checkbox',
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
        :input-name
        :id
        :true-value
        :false-value
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
          :input-name
          :id
          :true-value
          :false-value
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
            type="checkbox"
            v-model="value"
            :name="inputName"
            :id
            :value="trueValue"
            :true-value
            :false-value
            :disabled
            v-bind="bindings.input"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
            :ref="(el) => (inputRef = el)"
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
