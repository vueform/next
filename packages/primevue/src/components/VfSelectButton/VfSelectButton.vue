<script
  setup
  lang="ts"
  generic="
    TOptions extends OptionsProp = OptionsProp,
    TOptionValueKey extends OptionValueProp = undefined,
    TOptionValueReturn = unknown,
    TMultiple extends boolean = false,
    TModel = any
  "
>
import { defineEvents, useBlueprint } from '@vueform/core'
import PrimeSelectButton from 'primevue/selectbutton'

import { inputAria } from '#src/a11y'
import { blueprint, defaults } from '#src/blueprints/select-button'
import type { OptionsProp, OptionValueProp } from '#src/features'
import { vdomPrime } from '#src/helpers'

import type {
  VfSelectButtonEmits,
  VfSelectButtonProps,
  VfSelectButtonSlots,
} from './types'

const SelectButton = vdomPrime(PrimeSelectButton)

defineOptions({
  name: 'VfSelectButton',
  element: true,
  inheritAttrs: false,
  expressionable: true,
  nullValue: (props) => (props.multiple ? [] : null),
})
defineEmits<
  VfSelectButtonEmits<
    TOptions,
    TOptionValueKey,
    TMultiple,
    TModel,
    TOptionValueReturn
  >
>()

const props = withDefaults(
  defineProps<
    VfSelectButtonProps<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >(),
  defaults
)
const events =
  defineEvents<
    VfSelectButtonEmits<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >()
const slots =
  defineSlots<
    VfSelectButtonSlots<
      TOptions,
      TOptionValueKey,
      TMultiple,
      TModel,
      TOptionValueReturn
    >
  >()

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

useClasses(({ props }) => ({
  root: 'vf-select-button',
  input: props.layout === false ? props.class : null,
}))

useModifiers(({ hasError }) => ({
  input: {
    'data-invalid': hasError.value ? '' : undefined,
  },
}))

useA11y(inputAria())

const {
  value,
  viewLoaded,
  disabled,
  invalid,
  inputRef,
  rawItems,
  itemLabel,
  itemValue,
  itemDisabled,
  forwardProps,
  forwardSlots,
  handleInput,
  handleFocus,
  handleBlur,
} = api

const { multiple } = propRefs

defineExpose(expose)
</script>

<template>
  <slot v-if="viewLoaded" name="template" :context>
    <component v-if="outlets.template" :is="outlets.template" :context />
    <VfLayout v-else>
      <SelectButton
        v-model="value"
        :options="rawItems"
        :option-label="itemLabel"
        :option-value="itemValue"
        :option-disabled="itemDisabled"
        :disabled
        :invalid
        :multiple
        fluid
        v-bind="{ ...forwardProps, ...bindings.input }"
        :ref="(el) => (inputRef = el)"
        @focusin="handleFocus"
        @focusout="handleBlur"
        @change="(e) => handleInput(e.value, e.originalEvent)"
      >
        <template
          v-for="(slot, slotName) in forwardSlots"
          :key="slotName"
          #[slotName]="scope"
        >
          <component :is="slot" v-bind="scope" />
        </template>
      </SelectButton>
    </VfLayout>
  </slot>
</template>
