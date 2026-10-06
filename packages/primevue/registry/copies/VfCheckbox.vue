<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * Local copy of VfCheckbox of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfCheckboxEmits,
  type VfCheckboxProps,
  type VfCheckboxSlots,
} from '@vueform/primevue/components/VfCheckbox'
import PrimeCheckbox from 'primevue/checkbox'
import type { Ref } from 'vue'

import '@vueform/primevue/choice.css'

const Checkbox = vdomPrime(PrimeCheckbox)

defineOptions({
  name: 'VfCheckbox',
  element: true,
  inheritAttrs: false,
  expressionable: true,
})
defineEmits<VfCheckboxEmits<TTrueValue, TFalseValue>>()

const props = withDefaults(
  defineProps<VfCheckboxProps<TTrueValue, TFalseValue>>(),
  defaults
)
const events = defineEvents<VfCheckboxEmits<TTrueValue, TFalseValue>>()
const slots = defineSlots<VfCheckboxSlots<TTrueValue, TFalseValue>>()

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

useClasses(({ props }) => ({
  root: 'vf-checkbox',
  wrapper: {
    'vf-choice-wrapper': true,
    'vf-left': props.align === 'left',
    'vf-right': props.align === 'right',
    'vf-aligned': !!props.aligned,
  },
  text: 'vf-choice-text',
}))

const trueValue = propRefs.trueValue as Ref<TTrueValue>
const falseValue = propRefs.falseValue as Ref<TFalseValue>

const {
  model,
  value,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  aria,
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

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <slot
        :model
        :aria
        :input-name
        :id
        :true-value
        :false-value
        :disabled
        :input
        :text
        :handle-blur
        :handle-focus
        :handle-input
      >
        <component
          v-if="outlets?.default"
          :is="outlets.default"
          :model
          :aria
          :input-name
          :id
          :true-value
          :false-value
          :disabled
          :input
          :text
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="parts.wrapper">
          <Checkbox
            :name="inputName"
            :input-id="id"
            :class="classes.input"
            v-model="value"
            :true-value
            :false-value
            :disabled
            :readonly
            :invalid
            binary
            v-bind="{
              ...aria,
              ...forwardProps,
              ...parts.input,
            }"
            :ref="(el) => (input = el)"
            @change="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
          >
            <template
              v-for="(slot, slotName) in forwardSlots"
              :key="slotName"
              #[slotName]="scope"
            >
              <component :is="slot" v-bind="scope" />
            </template>
          </Checkbox>
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
