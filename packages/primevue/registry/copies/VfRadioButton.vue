<script setup lang="ts" generic="const TRadioValue = true">
/**
 * Local copy of VfRadioButton of Vueform. How to customize it:
 * https://primevue.vueform.com/guide/components#building-on-blueprints
 */

import {
  defineEvents,
  useBlueprint,
  inputAria,
  vdomPrime,
} from '@vueform/primevue'
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

const { api, context, expose, outlets, propRefs, useClasses, useBindings } =
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
  inputName,
  text,
  inputRef,
  genericName,
  forwardProps,
  forwardSlots,
  handleBlur,
  handleFocus,
  handleInput,
  handleModelUpdate,
} = api

const classes = useClasses({
  root: 'vf-radio-button',
  wrapper: 'vf-choice-wrapper',
  text: 'vf-choice-text',
})

const bindings = useBindings(
  {
    root: () => ({
      'data-align-label': !api.help.value ? '' : undefined,
    }),
    wrapper: () => ({
      'data-align': api.props.align || undefined,
      'data-aligned': api.props.aligned ? '' : undefined,
    }),
    input: () => ({
      'data-invalid': api.hasError.value ? '' : undefined,
    }),
  },
  inputAria(api)
)

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
        :bindings="bindings.wrapper()"
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
          :input-ref="inputRef"
          :text
          :bindings="bindings.wrapper()"
          :handle-blur
          :handle-focus
          :handle-input
          :handle-model-update
        />
        <div v-else :class="classes.wrapper" v-bind="bindings.wrapper()">
          <RadioButton
            v-model="value"
            :name="inputName"
            :input-id="id"
            :value="radioValue"
            :disabled
            :readonly
            :invalid
            :class="classes.input"
            v-bind="{ ...forwardProps, ...bindings.input() }"
            :ref="(el) => (inputRef = el)"
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
          <slot name="text" :text :id :generic-name :bindings="bindings.text()">
            <component
              v-if="outlets?.text"
              :is="outlets.text"
              :text
              :id
              :generic-name
              :bindings="bindings.text()"
            />
            <label
              v-else-if="text"
              :for="id"
              :class="classes.text"
              v-bind="bindings.text()"
            >
              {{ text }}
            </label>
            <label v-else class="sr-only" :for="id">{{ genericName }}</label>
          </slot>
        </div>
      </slot>
    </VfLayout>
  </slot>
</template>
