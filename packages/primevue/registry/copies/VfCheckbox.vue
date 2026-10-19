<script
  setup
  lang="ts"
  generic="const TTrueValue = true, const TFalseValue = false"
>
/**
 * Local copy of VfCheckbox of Vueform. How to customize it:
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

useClasses(() => ({
  root: 'vf-checkbox',
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
        :handle-input
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
          :handle-input
          :handle-model-update
        />
        <div v-else v-bind="bindings.wrapper">
          <Checkbox
            :name="inputName"
            :input-id="id"
            v-model="value"
            :true-value
            :false-value
            :disabled
            :readonly
            :invalid
            binary
            v-bind="{ ...bindings.input, ...forwardProps }"
            :ref="(el) => (inputRef = el)"
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
