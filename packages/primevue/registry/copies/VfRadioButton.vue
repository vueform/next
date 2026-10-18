<script setup lang="ts" generic="const TRadioValue = true">
/**
 * Local copy of VfRadioButton of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import { defineEvents, useBlueprint, vdomPrime } from '@vueform/primevue'
import {
  blueprint,
  defaults,
  type VfRadioButtonEmits,
  type VfRadioButtonProps,
  type VfRadioButtonSlots,
} from '@vueform/primevue/components/VfRadioButton'
import PrimeRadioButton from 'primevue/radiobutton'
import type { Ref } from 'vue'

import '@vueform/primevue/choice.css'

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

const { api, parts, classes, context, expose, outlets, propRefs, useClasses } =
  useBlueprint(blueprint, props, events, slots)

const radioValue = propRefs.value as Ref<TRadioValue> // @todo: look into if it's possible to remove this from all comps

const {
  model,
  value,
  id,
  disabled,
  readonly,
  invalid,
  viewLoaded,
  a11yBindings,
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

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else :label="false">
      <slot
        :model
        :value="radioValue"
        :a11y-bindings="a11yBindings"
        :input-name
        :id
        :disabled
        :input
        :text
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
          :a11y-bindings="a11yBindings"
          :input-name
          :id
          :disabled
          :input
          :text
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
          :class="classes.wrapper"
          v-bind="parts.wrapper"
        />
        <div
          v-else
          :class="classes.wrapper"
          :data-align="props.align || undefined"
          :data-aligned="props.aligned ? '' : undefined"
          v-bind="parts.wrapper"
        >
          <RadioButton
            v-model="value"
            :name="inputName"
            :input-id="id"
            :class="classes.input"
            :value="radioValue"
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
          </RadioButton>
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
