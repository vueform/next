<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
import type { Ref } from 'vue'

import { defaults, blueprint } from '#src/blueprints/checkbox'
import { useBlueprint } from '#src/composables'
import { defineEvents } from '#src/helpers'

import type { VfCheckboxEmits, VfCheckboxProps, VfCheckboxSlots } from './types'

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
  parts,
  classes,
  context,
  expose,
  outlets,
  propRefs,
  a11yBindings,
  modifiers,
  useClasses,
  useModifiers,
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
  input,
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
        :input
        :text
        :classes
        :parts
        :modifiers
        :a11y-bindings
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
          :input
          :text
          :classes
          :parts
          :modifiers
          :a11y-bindings
          :handle-blur
          :handle-focus
          :handle-model-update
        />
        <div
          v-else
          :class="classes.wrapper"
          v-bind="{ ...modifiers.wrapper, ...parts.wrapper }"
        >
          <input
            type="checkbox"
            v-model="value"
            :name="inputName"
            :id
            :value="trueValue"
            :true-value
            :false-value
            :disabled
            :class="classes.input"
            v-bind="{
              ...modifiers.input,
              ...a11yBindings.input,
              ...parts.input,
            }"
            @blur="handleBlur"
            @focus="handleFocus"
            @change="handleInput"
            :ref="(el) => (input = el)"
          />
          <slot
            name="text"
            :text
            :id
            :generic-name
            :classes="classes.text"
            :part="parts.text"
          >
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :classes="classes.text"
              :part="parts.text"
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
